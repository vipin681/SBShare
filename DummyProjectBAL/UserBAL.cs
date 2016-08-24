using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DummyProjectStateClass;
using DummyProjectDAL;
using System.Security.Cryptography;
using System.Net;
using NLog;
using System.Configuration;
using System.Web.Script.Serialization;
using System.Security.Claims;
using System.Collections;

namespace DummyProjectBAL
{
    public class UserBAL
    {
        Logger logger = LogManager.GetCurrentClassLogger();
        # region GetUser
        public Result GetUserList()
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetUserList();
        }
        #endregion

        #region SearchUser
        public Result GetUserDetailsBysearch(string searchstring)
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetUserListByID(searchstring);
        }
        #endregion

        #region Update Password
        public Result UpdateUserPassword(UpdateUserPassword userPassword)
        {
            UserDAL userDAL = new UserDAL();
            Result result = userDAL.Updatepassword(userPassword);
            return result;

        }
        #endregion

        #region Insert\Update user

        public Result InsertUser(UserDetails user)
        {
            UserDAL userDAL = new UserDAL();
            user.SaltValue = GenerateSalt();
            logger.Debug("DAl Started");
            user.password = GetHashedValue(user.password, user.SaltValue);
            Result result = userDAL.InsertUser(user);
            result.Token = CreateToken(user, result);
            return result;
        }
        public Result UpdateUser(UserDetails user)
        {
            //using (TransactionScope scope = new TransactionScope())
            //{
            UserDAL userDAL = new UserDAL();
            Result result = userDAL.UpdateUser(user);
            return result;
            // }
        }

        #endregion

        # region GetUserDetailsByID
        public Result GetUserDetailsByID(Int32 ID)
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetUserDetailsByID(ID);
        }
        #endregion


        #region Create Token region
        public string CreateToken(UserDetails user,Result result)
        {
            var unixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var expiry = Math.Round((DateTime.UtcNow.AddHours(2) - unixEpoch).TotalSeconds);
            var issuedAt = Math.Round((DateTime.UtcNow - unixEpoch).TotalSeconds);

            var payload = new Dictionary<string, object>()
             {
                { "firstname", user.firstname },
                { "lastname", user.lastname },
                { "userid", result.Results },
                { "roleid", user.roleid },
                {"description",user.RoleName },
                { "emailid", user.emailaddress },
                { "iat", issuedAt},
                { "exp", expiry}

             };
            var secretKey = ConfigurationManager.AppSettings.Get("JWTsecret");
            string token = DummyProjectBAL.JsonWebToken.Encode(payload, secretKey, DummyProjectBAL.JwtHashAlgorithm.HS256);
            return token;
        }
        #endregion

        #region Get User Role List
        public Result GetRole()
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetRole();
        }
        #endregion

        #region All



        public Result UserLookup(String TypeHeadKeyword)
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.UserLookup(TypeHeadKeyword);
        }


        public Result GetUserListByID(String keyword)
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetUserListByID(keyword);
        }

        public Result IsValidUser(String emailaddress, String userPassword)
        {
            UserDAL userDAL = new UserDAL();

            UserDetails objUser = null;
            objUser = userDAL.IsValidUser(emailaddress, userPassword);
            if (objUser != null)
            {
                if (objUser.password == userPassword)
                {
                    //#region Create Token region
                    //var unixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                    //var expiry = Math.Round((DateTime.UtcNow.AddHours(2) - unixEpoch).TotalSeconds);
                    //var issuedAt = Math.Round((DateTime.UtcNow - unixEpoch).TotalSeconds);

                    //var payload = new Dictionary<string, object>()
                    //     {
                    //        { "firstname", objUser.firstname },
                    //        { "lastname", objUser.lastname }, 
                    //        { "userid", objUser.userid },
                    //        { "roleid", objUser.roleid },
                    //        { "emailid", emailaddress },
                    //        { "iat", issuedAt},
                    //        { "exp", expiry}

                    //     };
                    //var secretKey = ConfigurationManager.AppSettings.Get("JWTsecret");
                    //string token = DummyProjectBAL.JsonWebToken.Encode(payload, secretKey, DummyProjectBAL.JwtHashAlgorithm.HS256);
                    
                    //#endregion

                    return new Result
                    {
                        Status = Convert.ToString((int)HttpStatusCode.OK),
                        errormsg = "",
                        Results = new
                        {
                            UserID = objUser.userid,
                            Role = objUser.roleid,
                            RoleName=objUser.RoleName
                            
                        },
                        Token = ""
                    };
                }
                else
                {
                    return new Result
                    {
                        Status = Convert.ToString((int)HttpStatusCode.Unauthorized),
                        MessageId = 11,
                        Results = null
                    };
                }
            }
            else
            {
                return new Result
                {
                    Status = Convert.ToString((int)HttpStatusCode.NotFound),
                    MessageId = 12,
                    Results = null
                };
            }
        }

        public Result RefreshToken(String oldtoken)
        {
            string firstname = "";
            string lastname = "";
            string emailid = "";
            string roleid = "";
            string userid = "";
            string exp_str = "";
            string token = "";
            var jsonSerializer = new JavaScriptSerializer();
            var payloadJson = JsonWebToken.Decode(oldtoken, ConfigurationManager.AppSettings.Get("JWTsecret"));
            var payloadData = jsonSerializer.Deserialize<Dictionary<string, object>>(payloadJson);
            try
            {


                object exp;
                if (payloadData != null && (payloadData.TryGetValue("exp", out exp)))
                {
                    var validTo = FromUnixTime(long.Parse(exp.ToString()));
                    if (DateTime.Compare(validTo, DateTime.UtcNow) <= 0)
                    {
                        //return "";
                        throw new Exception(
                            string.Format("Token is expired. Expiration: '{0}'. Current: '{1}'", validTo, DateTime.UtcNow));
                    }
                }



                var subject = new ClaimsIdentity("Federation", ClaimTypes.Name, ClaimTypes.Role);

                var claims = new List<Claim>();

                if (payloadData != null)
                    foreach (var pair in payloadData)
                    {
                        var claimType = pair.Key;

                        var source = pair.Value as ArrayList;

                        if (source != null)
                        {
                            claims.AddRange(from object item in source
                                            select new Claim(claimType, item.ToString(), ClaimValueTypes.String));

                            continue;
                        }

                        switch (pair.Key)
                        {
                            case "firstname":
                                firstname = pair.Value.ToString();
                                break;
                            case "lastname":
                                lastname = pair.Value.ToString();
                                break;
                            case "emailid":
                                emailid = pair.Value.ToString();
                                break;
                            case "roleid":
                                roleid = pair.Value.ToString();
                                break;
                            case "userid":
                                userid = pair.Value.ToString();
                                break;
                            case "exp":
                                exp_str = pair.Value.ToString();
                                break;
                                //default:
                                //     claims.Add(new Claim(claimType, pair.Value.ToString(), ClaimValueTypes.String));
                                //     break;
                        }
                    }


                #region Create Token region
                var unixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                var expiry = Math.Round((DateTime.UtcNow.AddHours(2) - unixEpoch).TotalSeconds);
                var issuedAt = Math.Round((DateTime.UtcNow - unixEpoch).TotalSeconds);

                var payload = new Dictionary<string, object>()
                         {
                            { "firstname", firstname },
                            { "lastname", lastname},
                            { "userid", userid },
                            { "roleid", roleid },
                            { "emailid", emailid },
                            { "iat", issuedAt},
                            { "exp", exp_str}

                         };
                var secretKey = ConfigurationManager.AppSettings.Get("JWTsecret");
                 token = DummyProjectBAL.JsonWebToken.Encode(payload, secretKey, DummyProjectBAL.JwtHashAlgorithm.HS256);
                return new Result
                {
                    Status = Convert.ToString((int)HttpStatusCode.OK),
                    errormsg = "",
                    Results = new
                    {
                        UserID = userid,
                        Role = roleid,

                    },
                    Token = token
                };
            }
            catch (Exception ex)
            {
                return new Result
                {
                    Status = Convert.ToString((int)HttpStatusCode.InternalServerError),
                    errormsg = ex.Message,
                    Results = new
                    {
                        

                    },
                    Token = token
                };
            }
                    #endregion
            
        }

        private DateTime FromUnixTime(long unixTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return epoch.AddSeconds(unixTime);
        }

        public int IsUserAuthorized(int APIID, int roleid)
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.IsUserAuthorized(APIID, roleid);
        }

        
        //public Result GetCountryList()
        //{
        //    UserDAL userDAL = new UserDAL();
        //    return userDAL.GetCountryList();
        //}
        //public Result GetStateList()
        //{
        //    UserDAL userDAL = new UserDAL();
        //    return userDAL.GetStateList();
        //}

        public UserToken GetUserDetailsByTokenID(string tokenID)
        {
            UserDAL objUserDAL = new UserDAL();
            return objUserDAL.GetUserDetailsByTokenID(tokenID);
        }

        public Result GetItemDetails()
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetItemDetails();
        }
        //public Result GetMenuCRUDSelect(string menuID, string menuName)
        //{
        //    UserDAL userDAL = new UserDAL();
        //    if (menuID == null)
        //        menuID = "";
        //    if (menuName == null)
        //        menuName = "";
        //    return userDAL.GetMenuCRUDSelect(menuID, menuName);
        //}

        //public Result getUserRoleDetails(string UserRole)
        //{
        //    UserDAL userDAL = new UserDAL();
        //    if (UserRole == null)
        //        UserRole = "";
        //    return userDAL.getUserRoleDetails(UserRole);
        //}

  

        //public Result insertMenu(UserDetails user)
        //{
        //    UserDAL userDAL = new UserDAL();
        //    user.SaltValue = GenerateSalt();
        //    //  user.Password = GetHashedValue(user.Password, user.SaltValue);
        //    Result result = userDAL.insertMenu(user);

        //    return result;
        //}

        public static string GenerateSalt()
        {
            byte[] saltBytes = null;
            // Define min and max salt sizes.
            int minSaltSize = 0;
            int maxSaltSize = 0;

            minSaltSize = 4;
            maxSaltSize = 8;

            // Generate a random number for the size of the salt.
            Random random = null;
            random = new Random();

            int saltSize = 0;
            saltSize = random.Next(minSaltSize, maxSaltSize);

            // Allocate a byte array, which will hold the salt.
            saltBytes = new byte[saltSize];

            // Initialize a random number generator.
            RNGCryptoServiceProvider rng = null;
            rng = new RNGCryptoServiceProvider();

            // Fill the salt with cryptographically strong byte values.
            rng.GetNonZeroBytes(saltBytes);

            return Convert.ToBase64String(saltBytes);
        }
        /// <summary>
        /// Used to get the hash value
        /// </summary>
        /// <param name="PlainText"></param>
        /// <param name="HashSalt"></param>
        /// <returns></returns>
        public static string GetHashedValue(string PlainText, string HashSalt)
        {
            // Convert plain text into a byte array.
            byte[] plainTextBytes = null;
            plainTextBytes = Encoding.UTF8.GetBytes(PlainText);

            //Convert Hashsalt to byte array
            byte[] saltBytes = null;
            saltBytes = Encoding.UTF8.GetBytes(HashSalt);

            // Allocate array, which will hold plain text and salt.
            byte[] plainTextWithSaltBytes = new byte[plainTextBytes.Length + saltBytes.Length];

            // Copy plain text bytes into resulting array.
            int I = 0;
            for (I = 0; I <= plainTextBytes.Length - 1; I++)
            {
                plainTextWithSaltBytes[I] = plainTextBytes[I];
            }

            // Append salt bytes to the resulting array.
            for (I = 0; I <= saltBytes.Length - 1; I++)
            {
                plainTextWithSaltBytes[plainTextBytes.Length + I] = saltBytes[I];
            }

            MD5CryptoServiceProvider Md5 = new MD5CryptoServiceProvider();
            //Compute the hash value from the source
            byte[] ByteHash = Md5.ComputeHash(plainTextWithSaltBytes);
            //And convert it to String format for return
            return Convert.ToBase64String(ByteHash);

        }

        #endregion
        public Role GetAuthorizeRole()
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetAuthorizeRole();
        }


    }
}
