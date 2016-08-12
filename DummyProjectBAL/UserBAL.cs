using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DummyProjectStateClass;
using DummyProjectDAL;
using System.Security.Cryptography;
using System.Net;

namespace DummyProjectBAL
{
    public class UserBAL
    {
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

        #region Insert\Update user

        public Result InsertUser(UserDetails user)
        {
            UserDAL userDAL = new UserDAL();
            user.SaltValue = GenerateSalt();
            user.password = GetHashedValue(user.password, user.SaltValue);
            Result result = userDAL.InsertUser(user);

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



        #region All

        public Result GetUserDetailsByID(Int64 ID)
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetUserDetailsByID(ID);
        }
   
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

        public Result IsValidUser(String userName, String userPassword)
        {
            UserDAL userDAL = new UserDAL();

            UserDetails objUser = null;
            objUser = userDAL.IsValidUser(userName, userPassword);
            if (objUser != null)
            {
                if (objUser.password == userPassword)
                {
                    return new Result
                    {
                        Status = Convert.ToString((int)HttpStatusCode.OK),
                        errormsg="",
                        Results = new
                        {
                            UserID = objUser.userid,
                            TokenID = objUser.TokenID,
                            Role = objUser.roleid,
                            // Language = objUser.Language.LanguageName
                        }
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
        public Result GetRole()
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetRole();
        }
        public Result GetCountryList()
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetCountryList();
        }
        public Result GetStateList()
        {
            UserDAL userDAL = new UserDAL();
            return userDAL.GetStateList();
        }
  
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

        public Result getMenubyUserRole(string UserRole)
        {
            UserDAL userDAL = new UserDAL();
            if (UserRole == null)
                UserRole = "";
            return userDAL.getMenubyUserRole(UserRole);
        }

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



    }
}
