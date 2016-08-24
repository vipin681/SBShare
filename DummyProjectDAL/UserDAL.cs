using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DummyProjectStateClass;
using System.Data.SqlClient;
using System.Data;
using System.Net;
using DummyProjectDAL;
using NLog;


namespace DummyProjectDAL
{
    public class UserDAL
    {
        Logger logger = LogManager.GetCurrentClassLogger();
        #region GetUser
        public Result GetUserList()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                string strQuery;
                SqlCommand cmd;
                strQuery = "Select  userid, firstname as fName,firstname + ' ' + lastname as Fullname, password,lastname as lName,emailaddress as emailId,workerid ,[security].[Users].status,[security].[Role].code as appName,[security].[Role].description as appRole FROM [security].[Users] INNER join [security].[Role]  on  [Users].roleid =[security].[Role].roleid ";
                cmd = new SqlCommand(strQuery);
                SqlDataAdapter sqlad = new SqlDataAdapter(cmd);
                DataSet ds = new DataSet();
                cmd.Connection = conn;
                sqlad.Fill(ds);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    user = new UserDetails();

                    return new Result
                    {
                        Results = ds.Tables[0],
                    };
                }
                return new Result
                {
                    errormsg = "Data Not found",
                    Status = Convert.ToString((int)HttpStatusCode.NotFound),
                    Results = null
                };
            }
        }
        #endregion

        #region SearchUser
        public Result GetUserListByID(String keyword)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "security.usp_GetAllUser";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@TypeHeadKeyword", SqlDbType.NVarChar, 200).Value = keyword;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return new Result
                        {
                            Results = ds.Tables[0],

                        };
                    }
                    return new Result
                    {
                        Results = null
                    };
                }
            }
        }
        #endregion

        #region Update User Password
        public Result Updatepassword(UpdateUserPassword userPassword)
        {
            try
            {
                using (SqlConnection conn = DbHelper.CreateConnection())
                {

                    string strQuery;
                    SqlCommand cmd;

                    strQuery = "UPDATE security.Users SET [password]=@paramnewPassword,@parammodifiedby= @paramuserid,@parammodifieddate=getdate()   WHERE userid = @paramuserid ";
                    cmd = new SqlCommand(strQuery);
                    cmd.Connection = conn;
                    cmd.Parameters.Add("@paramuserid", SqlDbType.Int).Value = userPassword.userid;
                    cmd.Parameters.Add("@paramnewPassword", SqlDbType.VarChar, 150).Value = CommonFunctions.MD5Encryption(userPassword.Password);
                    cmd.Parameters.Add("@parammodifiedby", SqlDbType.Int).Value = userPassword.modifiedby;
                    cmd.Parameters.Add("@parammodifieddate", SqlDbType.DateTime).Value = userPassword.modifieddate;
                    int flag = cmd.ExecuteNonQuery();
                    return new Result
                    {
                        Results = flag
                    };

                }

            }


            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region Get User Details ByID
        public Result GetUserDetailsByID(Int32 ID)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                string strQuery;
                SqlCommand cmd;
                strQuery = "Select  userid, firstname as fName,firstname + ' ' + lastname as Fullname, password,lastname as lName,emailaddress as emailId,workerid ,[security].[Users].status,[security].[Role].code as appName,[security].[Role].description as appRole FROM [security].[Users] INNER join [security].[Role]  on  [Users].roleid =[security].[Role].roleid  WHERE [security].[Users].userid = @userid  ";
                cmd = new SqlCommand(strQuery);
                SqlDataAdapter sqlad = new SqlDataAdapter(cmd);
                DataSet ds = new DataSet();
                cmd.Connection = conn;
                cmd.Parameters.Add("@userid", SqlDbType.Int).Value = ID;
                sqlad.Fill(ds);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {

                    return new Result
                    {
                        Results = ds.Tables[0],
                    };
                }
                return new Result
                {
                    errormsg = "Data Not found",
                    Status = Convert.ToString((int)HttpStatusCode.NotFound),
                    Results = null
                };
                //}
            }
        }
        #endregion

        #region IsUserAuthorized
        public int IsUserAuthorized(int APIID, int roleid)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "Select status from RoleAPIMatrix where roleid=@roleid and apiid=@apiid";
                    sqlcmd.CommandType = CommandType.Text;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@roleid", SqlDbType.NVarChar, 200).Value = roleid;
                    sqlcmd.Parameters.Add("@apiid", SqlDbType.NVarChar, 200).Value = APIID;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return Convert.ToInt32(ds.Tables[0].Rows[0]["status"]);

                    }
                    else
                    {
                        return 0;
                    }
                }
            }
        }
        #endregion

        #region IsValidUser
        public UserDetails IsValidUser(String emailaddress, String userPassword ,int clientid)
        {
            UserDetails objUser = null;
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                string strQuery;
                SqlCommand cmd;
                strQuery = " SELECT  firstname,lastname, u.userid, [Password], u.roleid,role.description FROM security.Users u with (nolock) INNER JOIN [security].[Role] role with (nolock) on role.roleid = u.roleid  WHERE emailaddress=@emailaddress and Password=@userPassword and u.clientid=@clientid  ";
                cmd = new SqlCommand(strQuery);
                SqlDataAdapter sqlad = new SqlDataAdapter(cmd);
                DataSet ds = new DataSet();
                cmd.Connection = conn;
                cmd.Parameters.Add("@emailaddress", SqlDbType.NVarChar, 100).Value = emailaddress;
                cmd.Parameters.Add("@userPassword", SqlDbType.NVarChar, 100).Value = userPassword;
                cmd.Parameters.Add("@clientid", SqlDbType.Int).Value = clientid;
                sqlad.Fill(ds);

                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {

                    objUser = new UserDetails();
                    objUser.userid = Convert.ToInt32(ds.Tables[0].Rows[0]["userid"].ToString());
                    objUser.password = ds.Tables[0].Rows[0]["Password"].ToString();
                    objUser.roleid = Convert.ToInt32(ds.Tables[0].Rows[0]["roleid"]);
                    objUser.firstname = ds.Tables[0].Rows[0]["firstname"].ToString();
                    objUser.lastname = ds.Tables[0].Rows[0]["lastname"].ToString();
                    objUser.userid = Convert.ToInt32(ds.Tables[0].Rows[0]["userid"].ToString());
                    objUser.themeid = Convert.ToInt32(ds.Tables[0].Rows[0]["themeid"]);
                    if (objUser.FirstTimeLogin_YN == false)
                    {

                        #region Update firstLogin time and flag
                        string strQuery1;
                        SqlCommand cmd1;
                        strQuery1 = "update [security].[Users] set FirstTimeLogin_YN=@FirstTimeLogin_YN ,firstTimeLogin=getdate() where userid=@userid";
                        cmd1 = new SqlCommand(strQuery1);
                        cmd1.Connection = conn;
                        cmd1.Parameters.Add("@userid", SqlDbType.Int).Value = objUser.userid;
                        cmd1.Parameters.Add("@FirstTimeLogin_YN", SqlDbType.Bit).Value = true;
                        cmd1.ExecuteNonQuery();
                        #endregion

                    }

                }
            return objUser;
        }
        #endregion

        #region InsertUser
        public Result InsertUser(UserDetails user)
        {
            logger.Debug("Database Inserted");
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                string strQuery;
                SqlCommand cmd;

                strQuery = "INSERT INTO [security].[Users] ( clientid, emailaddress, firstname, lastname, password, middleinitial, workerid, hrparentid, supervisorid, locationid, locationparentid, teamid, teamparentid, unitid, unitparentid, roleid, appid, status, acceptedTerms, firstTimeLogin, createdby, createddate ) VALUES (@clientid, @emailaddress, @firstname, @lastname, @password, @middleinitial, @workerid, @hrparentid, @supervisorid, @locationid, @locationparentid, @teamid, @teamparentid, @unitid, @unitparentid, @roleid, @appid, @status, @acceptedTerms, @firstTimeLogin, @createdby,getdate())";
                cmd = new SqlCommand(strQuery);
                cmd.Connection = conn;
                //cmd.CommandText = "INSERT INTO [security].[Users] ( clientid, emailaddress, firstname, lastname, password, middleinitial, workerid, hrparentid, supervisorid, locationid, locationparentid, teamid, teamparentid, unitid, unitparentid, roleid, appid, status, acceptedTerms, firstTimeLogin, createdby, createddate ) VALUES (@clientid, @emailaddress, @firstname, @lastname, @password, @middleinitial, @workerid, @hrparentid, @supervisorid, @locationid, @locationparentid, @teamid, @teamparentid, @unitid, @unitparentid, @roleid, @appid, @status, @acceptedTerms, @firstTimeLogin, @createdby,getdate())";

                cmd.Parameters.Add("@userid", SqlDbType.Int).Direction = ParameterDirection.Output;
                cmd.Parameters.Add("@clientid", SqlDbType.Int).Value = user.clientid;
                cmd.Parameters.Add("@emailaddress", SqlDbType.VarChar, 50).Value = user.emailaddress;
                cmd.Parameters.Add("@firstname", SqlDbType.VarChar, 50).Value = user.firstname;
                cmd.Parameters.Add("@lastname", SqlDbType.VarChar, 50).Value = user.lastname;
                cmd.Parameters.Add("@password", SqlDbType.VarChar, 5000).Value = user.password;
                cmd.Parameters.Add("@middleinitial", SqlDbType.VarChar, 100).Value = user.middleinitial;
                cmd.Parameters.Add("@workerid", SqlDbType.VarChar, 50).Value = user.workerid;
                cmd.Parameters.Add("@hrparentid", SqlDbType.Int).Value = user.hrparentid;
                cmd.Parameters.Add("@supervisorid", SqlDbType.Int).Value = user.supervisorid;
                cmd.Parameters.Add("@locationid", SqlDbType.Int).Value = user.locationid;
                cmd.Parameters.Add("@locationparentid", SqlDbType.Int).Value = user.locationparentid;
                cmd.Parameters.Add("@teamid", SqlDbType.Int).Value = user.teamid;
                cmd.Parameters.Add("@teamparentid", SqlDbType.Int).Value = user.teamparentid;
                cmd.Parameters.Add("@unitid", SqlDbType.Int).Value = user.unitid;
                cmd.Parameters.Add("@unitparentid", SqlDbType.Int).Value = user.unitparentid;
                cmd.Parameters.Add("@roleid", SqlDbType.Int).Value = user.roleid;
                cmd.Parameters.Add("@appid", SqlDbType.Int).Value = user.appid;
                cmd.Parameters.Add("@status", SqlDbType.Bit).Value = user.status;
                cmd.Parameters.Add("@acceptedTerms", SqlDbType.Bit).Value = user.acceptedTerms;
                cmd.Parameters.Add("@firstTimeLogin", SqlDbType.DateTime).Value = user.firstTimeLogin;
                cmd.Parameters.Add("@createdby", SqlDbType.Int).Value = user.createdby;

             int flag=   cmd.ExecuteNonQuery();
                return new Result
                {

                    Results = flag
                    //(cmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int32)cmd.Parameters["@UserID"].Value)
                };
                logger.Debug("Save Data");
            }
        }
        #endregion

        #region UpdateUser
        public Result UpdateUser(UserDetails user)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                string strQuery;
                SqlCommand cmd;
                strQuery = "UPDATE [security].[Users] SET emailaddress=@emailaddress ,firstname=@firstname,lastname=@lastname,middleinitial=@middleinitial,status=@status,modifiedby=@modifiedby,roleid= @roleid ,workerid=@workerid WHERE userid = @userid ";
                cmd = new SqlCommand(strQuery);
                cmd.Connection = conn;
                //cmd.CommandType = CommandType.StoredProcedure;
                cmd.Parameters.Add("@userid", SqlDbType.Int).Value = user.userid; ;
                cmd.Parameters.Add("@insertedSuccesfully", SqlDbType.Int).Direction = ParameterDirection.Output;
                cmd.Parameters.Add("@clientid", SqlDbType.Int).Value = user.clientid;
                cmd.Parameters.Add("@emailaddress", SqlDbType.VarChar, 50).Value = user.emailaddress;
                cmd.Parameters.Add("@firstname", SqlDbType.VarChar, 50).Value = user.firstname;
                cmd.Parameters.Add("@lastname", SqlDbType.VarChar, 50).Value = user.lastname;
                cmd.Parameters.Add("@password", SqlDbType.VarChar, 5000).Value = user.password;
                cmd.Parameters.Add("@middleinitial", SqlDbType.VarChar, 100).Value = user.middleinitial;
                cmd.Parameters.Add("@workerid", SqlDbType.VarChar, 50).Value = user.workerid;
                cmd.Parameters.Add("@hrparentid", SqlDbType.Int).Value = user.hrparentid;
                cmd.Parameters.Add("@supervisorid", SqlDbType.Int).Value = user.supervisorid;
                cmd.Parameters.Add("@locationid", SqlDbType.Int).Value = user.locationid;
                cmd.Parameters.Add("@locationparentid", SqlDbType.Int).Value = user.locationparentid;
                cmd.Parameters.Add("@teamid", SqlDbType.Int).Value = user.teamid;
                cmd.Parameters.Add("@teamparentid", SqlDbType.Int).Value = user.teamparentid;
                cmd.Parameters.Add("@unitid", SqlDbType.Int).Value = user.unitid;
                cmd.Parameters.Add("@unitparentid", SqlDbType.Int).Value = user.unitparentid;
                cmd.Parameters.Add("@roleid", SqlDbType.Int).Value = user.roleid;
                cmd.Parameters.Add("@appid", SqlDbType.Int).Value = user.appid;
                cmd.Parameters.Add("@status", SqlDbType.Bit).Value = user.status;
                cmd.Parameters.Add("@acceptedTerms", SqlDbType.Bit).Value = user.acceptedTerms;
                cmd.Parameters.Add("@firstTimeLogin", SqlDbType.DateTime).Value = user.firstTimeLogin;
                cmd.Parameters.Add("@modifiedby", SqlDbType.Int).Value = user.modifiedby;
                cmd.Parameters.Add("@SaltValue", SqlDbType.VarChar, 5000).Value = user.SaltValue;

                cmd.ExecuteNonQuery();
                return new Result
                {
                    // MessageId = Convert.ToInt32(sqlcmd.Parameters["@MessageID"].Value),
                    //Status = Convert.ToBoolean(sqlcmd.Parameters["@Status"].Value),

                    Results = (cmd.Parameters["@insertedSuccesfully"].Value == DBNull.Value ? 0 : (Int32)cmd.Parameters["@insertedSuccesfully"].Value)

                };
                //}
            }
        }
        #endregion

        #region GetRole
        public Result GetRole()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = new UserDetails();
                string strQuery;
                SqlCommand cmd;

                strQuery = "Select roleid,description FROM security.Role WHERE status=1";
                cmd = new SqlCommand(strQuery);
                cmd.Connection = conn;
                SqlDataAdapter sqlad = new SqlDataAdapter(cmd);
                DataSet ds = new DataSet();

                sqlad.Fill(ds);
                if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                {
                    user = new UserDetails();

                    return new Result
                    {

                        Results = ds.Tables[0],
                    };
                }
                return new Result
                {
                    Results = null
                };

            }
        }
        #endregion

        #region ChangeTheme
        public Result ChangeTheme(int themeid, int userid)
        {
            try
            {
                using (SqlConnection conn = DbHelper.CreateConnection())
                {

                    string strQuery;
                    SqlCommand cmd;

                    strQuery = "UPDATE security.Users SET themeid=@paramthemeid   WHERE userid = @paramuserid ";
                    cmd = new SqlCommand(strQuery);
                    cmd.Connection = conn;
                    cmd.Parameters.Add("@paramuserid", SqlDbType.Int).Value = userid;
                    cmd.Parameters.Add("@paramthemeid", SqlDbType.Int).Value = themeid;
                    cmd.ExecuteNonQuery();
                    return new Result
                    {
                        Results = 1
                    };
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion

        #region all




        //public Result GetUserDetailsBysearch(string searchstring)
        //{
        //    using (SqlConnection conn = DbHelper.CreateConnection())
        //    {
        //        UserDetails user = null;
        //        using (SqlCommand sqlcmd = new SqlCommand())
        //        {
        //            SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
        //            DataSet ds = new DataSet();
        //            sqlcmd.CommandText = "usp_GetUserDetailsBysearch";
        //            sqlcmd.CommandType = CommandType.StoredProcedure;
        //            sqlcmd.Connection = conn;
        //            sqlcmd.Parameters.Add("@searchstring", SqlDbType.NVarChar, 50).Value = searchstring;
        //            sqlad.Fill(ds);
        //            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        //            {
        //                user = new UserDetails();
        //                user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
        //                user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
        //                user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
        //                user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
        //                user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
        //                user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
        //                //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
        //                if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
        //                    user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
        //                if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
        //                    user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
        //                if (ds.Tables[0].Rows[0]["RoleID"] != DBNull.Value)
        //                    user.role.RoleID = Convert.ToInt32(ds.Tables[0].Rows[0]["RoleID"].ToString());

        //                if (ds.Tables[0].Rows[0]["RoleName"] != DBNull.Value)
        //                    user.role.RoleName = ds.Tables[0].Rows[0]["RoleName"].ToString();
        //                user.WorkerID = ds.Tables[0].Rows[0]["WorkerID"].ToString();
        //                //return new Result
        //                //{
        //                //    Results = user
        //                //};
        //            }
        //            return new Result
        //            {
        //                // Status = false,
        //                // MessageId = 1,
        //                // Results = null
        //            };
        //        }
        //    }
        //}





        public Result UserLookup(String TypeHeadKeyword)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetAllUser";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@TypeHeadKeyword", SqlDbType.NVarChar, 200).Value = TypeHeadKeyword;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return new Result
                        {
                            Results = new
                            {
                                Data = ds.Tables[0],
                            }
                        };
                    }
                    return new Result
                    {
                        Results = null
                    };
                }
            }
        }

        public Result GetCountryList()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetAllCountry";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        Country country = new Country();
                        UserDetails user = new UserDetails();
                        //  country.CountryID =Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                        //  country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
                        return new Result
                        {

                            Results = ds.Tables[0]
                        };
                    }
                    return new Result
                    {
                        //Status = false,
                        //MessageId = 7,
                        //Results = null
                    };
                }
            }
        }
        public Result GetStateList()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetState";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        Country country = new Country();
                        UserDetails user = new UserDetails();
                        //  country.CountryID =Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                        //  country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
                        return new Result
                        {

                            Results = ds.Tables[0]
                        };
                    }
                    return new Result
                    {
                        //Status = false,
                        //MessageId = 7,
                        //Results = null
                    };
                }
            }
        }
        public UserToken GetUserDetailsByTokenID(string tokenID)
        {
            UserToken objUserToken = null;
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    sqlcmd.CommandText = "GetUserDetailsByTokenID";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@TokenID", SqlDbType.NVarChar).Value = tokenID;
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlad.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        objUserToken = new UserToken();
                        objUserToken.RoleID = Convert.ToInt32(ds.Tables[0].Rows[0]["roleid"]);
                        objUserToken.UserID = Convert.ToInt64(ds.Tables[0].Rows[0]["userid"]);
                    }
                    return objUserToken;
                }
            }
        }
        public Result GetItemDetails()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "USP_Item_Select";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    //sqlcmd.Parameters.Add("@ItemName", SqlDbType.NVarChar, 200).Value = ItemName;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        return new Result
                        {
                            Results = new
                            {
                                Data = ds.Tables[0],
                            }
                        };
                    }
                    return new Result
                    {
                        Results = null
                    };
                }
            }
        }
        //public Result GetMenuCRUDSelect(string menuID, string menuName)
        //{
        //    using (SqlConnection conn = DbHelper.CreateConnection())
        //    {
        //        UserDetails user = null;
        //        using (SqlCommand sqlcmd = new SqlCommand())
        //        {
        //            SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
        //            DataSet ds = new DataSet();
        //            sqlcmd.CommandText = "usp_GetUserDetailsByID";
        //            sqlcmd.CommandType = CommandType.StoredProcedure;
        //            sqlcmd.Connection = conn;
        //            sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuID;
        //            sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuName;
        //            sqlad.Fill(ds);
        //            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        //            {
        //                user = new UserDetails();
        //                user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
        //                user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
        //                user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
        //                user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
        //                user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
        //                user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
        //                //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
        //                if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
        //                    user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
        //                if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
        //                    user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
        //                if (ds.Tables[0].Rows[0]["RoleID"] != DBNull.Value)
        //                    user.role.RoleID = Convert.ToInt32(ds.Tables[0].Rows[0]["RoleID"].ToString());

        //                if (ds.Tables[0].Rows[0]["RoleName"] != DBNull.Value)
        //                    user.role.RoleName = ds.Tables[0].Rows[0]["RoleName"].ToString();
        //                user.WorkerID = ds.Tables[0].Rows[0]["WorkerID"].ToString();
        //                //return new Result
        //                //{
        //                //    Results = user
        //                //};
        //            }
        //            return new Result
        //            {
        //                // Status = false,
        //                // MessageId = 1,
        //                // Results = null
        //            };
        //        }
        //    }
        //}


        //public Result getUserRoleDetails(string UserRole)
        //{
        //    using (SqlConnection conn = DbHelper.CreateConnection())
        //    {
        //        UserDetails user = null;
        //        using (SqlCommand sqlcmd = new SqlCommand())
        //        {
        //            SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
        //            DataSet ds = new DataSet();
        //            sqlcmd.CommandText = "usp_GetUserDetailsByID";
        //            sqlcmd.CommandType = CommandType.StoredProcedure;
        //            sqlcmd.Connection = conn;
        //            sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = UserRole;
        //           // sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuName;
        //            sqlad.Fill(ds);
        //            if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
        //            {
        //                user = new UserDetails();
        //                user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
        //                user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
        //                user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
        //                user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
        //                user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
        //                user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
        //                //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
        //                if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
        //                    user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
        //                if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
        //                    user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
        //                if (ds.Tables[0].Rows[0]["RoleID"] != DBNull.Value)
        //                    user.role.RoleID = Convert.ToInt32(ds.Tables[0].Rows[0]["RoleID"].ToString());

        //                if (ds.Tables[0].Rows[0]["RoleName"] != DBNull.Value)
        //                    user.role.RoleName = ds.Tables[0].Rows[0]["RoleName"].ToString();
        //                user.WorkerID = ds.Tables[0].Rows[0]["WorkerID"].ToString();
        //                //return new Result
        //                //{
        //                //    Results = user
        //                //};
        //            }
        //            return new Result
        //            {
        //                // Status = false,
        //                // MessageId = 1,
        //                // Results = null
        //            };
        //        }
        //    }
        //}
        public Role GetAuthorizeRole()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                Role role = null;
                Result result = null;
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "GetRole";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                  //  sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = UserRole;
                    // sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuName;
                    sqlad.Fill(ds);

                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        role = new Role();
                        user = new UserDetails();
                        role.description= ds.Tables[0].Rows[0]["description"].ToString();
                        role.roleid = Convert.ToInt32(ds.Tables[0].Rows[0]["roleid"]);

                        //return new Result
                        //{
                        //    Results = new
                        //    {
                        //        Data = ds.Tables[0],
                        //    }
                        //};
                    }
                    //return new Result
                    //{
                    //    Results = null
                    //};

                    //if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    //{
                    //    result = new Result();
                    //    user = new UserDetails();
                    //    result.Status =ds.Tables[0].Rows[0]["status"].ToString();
                    //    user.description = ds.Tables[0].Rows[0]["description"].ToString();
                    //    //user.emailaddress = ds.Tables[0].Rows[0]["emailaddress"].ToString();
                    //    //user.password = ds.Tables[0].Rows[0]["Password"].ToString();
                    //    //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                    //    //if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
                    //    //    user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                    //    //if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
                    //    //  user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();

                    //    //user.workerid = ds.Tables[0].Rows[0]["workerid"].ToString();
                    //    //return new Result
                    //    //{
                    //    //    Results = user
                    //    //};
                    //}
                    //return new Result
                    //{
                    //    // Status = false,
                    //    // MessageId = 1,
                    //    // Results = null
                    //};
                    return role;
                }
            }
        }
        //public Result insertMenu(UserDetails user)
        //{
        //    using (SqlConnection conn = DbHelper.CreateConnection())
        //    {
        //        using (SqlCommand sqlcmd = new SqlCommand())
        //        {
        //            sqlcmd.CommandText = "USP_Menu_Insert";
        //            sqlcmd.Connection = conn;
        //            sqlcmd.CommandType = CommandType.StoredProcedure;
        //            sqlcmd.Parameters.Add("@UserID", SqlDbType.BigInt).Direction = ParameterDirection.Output;
        //            sqlcmd.Parameters.Add("@UserName", SqlDbType.NVarChar, 50).Value = (user.UserName == "null" ? DBNull.Value.ToString() : user.UserName);
        //            sqlcmd.Parameters.Add("@Password", SqlDbType.NVarChar, 20).Value = user.Password;
        //            sqlcmd.Parameters.Add("@LastName", SqlDbType.NVarChar, 40).Value = user.LastName;
        //            sqlcmd.Parameters.Add("@Phone", SqlDbType.NVarChar, 20).Value = user.Phone;
        //            sqlcmd.Parameters.Add("@Email", SqlDbType.NVarChar, 50).Value = user.Email;
        //            sqlcmd.Parameters.Add("@SaltValue", SqlDbType.NVarChar, 50).Value = user.SaltValue;
        //            sqlcmd.Parameters.Add("@CountryId", SqlDbType.NVarChar, 50).Value = user.CountryId;
        //            sqlcmd.Parameters.Add("@RoleId", SqlDbType.NVarChar, 50).Value = user.RoleID;
        //            // sqlcmd.Parameters.Add("@IsActice", SqlDbType.Bit).Value = user.IsActice;
        //            sqlcmd.Parameters.Add("@InsertedBy", SqlDbType.BigInt).Value = 2;
        //            sqlcmd.ExecuteNonQuery();
        //            return new Result
        //            {

        //                Results = (sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
        //            };
        //        }
        //    }
        //}
        #endregion






    }
}
