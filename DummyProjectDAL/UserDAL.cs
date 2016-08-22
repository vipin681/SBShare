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
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "[security].[usp_GetUserList]";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    // sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = ID;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        user = new UserDetails();
                        //user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
                        //user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
                        //user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
                        //user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
                        //user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
                        //user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
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
                    using (SqlCommand sqlcmd = new SqlCommand())
                    {
                        sqlcmd.CommandText = "security.UpdateUserPassword";
                        sqlcmd.Connection = conn;
                        sqlcmd.CommandType = CommandType.StoredProcedure;
                        sqlcmd.Parameters.Add("@paramuserid", SqlDbType.Int).Value = userPassword.userid;
                        sqlcmd.Parameters.Add("@paramnewPassword", SqlDbType.VarChar, 150).Value = CommonFunctions.MD5Encryption(userPassword.Password);
                        sqlcmd.Parameters.Add("@parammodifiedby", SqlDbType.Int).Value = userPassword.modifiedby;
                        sqlcmd.Parameters.Add("@parammodifieddate", SqlDbType.DateTime).Value = userPassword.modifieddate;
                        sqlcmd.ExecuteNonQuery();
                        return new Result
                        {
                            Results = (sqlcmd.Parameters["@paramuserid"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@paramuserid"].Value)
                        };
                    }
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
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetUserbyid";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@userid", SqlDbType.Int).Value = ID;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        //user = new UserDetails();
                        //user.userid = Convert.ToInt32(ds.Tables[0].Rows[0]["userid"].ToString());
                        //user.lastname = ds.Tables[0].Rows[0]["lastname"].ToString();
                        //user.emailaddress = ds.Tables[0].Rows[0]["emailaddress"].ToString();
                        //user.workerid = ds.Tables[0].Rows[0]["workerid"].ToString();


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
        }
        #endregion



        #region all
        public Result InsertUser(UserDetails user)
        {
            logger.Debug("Database Inserted");
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    sqlcmd.CommandText = "usp_InsertUser";
                    sqlcmd.Connection = conn;
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@userid", SqlDbType.Int).Direction = ParameterDirection.Output;
                    sqlcmd.Parameters.Add("@clientid", SqlDbType.Int).Value = user.clientid;
                    sqlcmd.Parameters.Add("@emailaddress", SqlDbType.VarChar, 50).Value = user.emailaddress;
                    sqlcmd.Parameters.Add("@firstname", SqlDbType.VarChar, 50).Value = user.firstname;
                    sqlcmd.Parameters.Add("@lastname", SqlDbType.VarChar, 50).Value = user.lastname;
                    sqlcmd.Parameters.Add("@password", SqlDbType.VarChar, 5000).Value = user.password;
                    sqlcmd.Parameters.Add("@middleinitial", SqlDbType.VarChar, 100).Value = user.middleinitial;
                    sqlcmd.Parameters.Add("@workerid", SqlDbType.VarChar, 50).Value = user.workerid;
                    sqlcmd.Parameters.Add("@hrparentid", SqlDbType.Int).Value = user.hrparentid;
                    sqlcmd.Parameters.Add("@supervisorid", SqlDbType.Int).Value = user.supervisorid;
                    sqlcmd.Parameters.Add("@locationid", SqlDbType.Int).Value = user.locationid;
                    sqlcmd.Parameters.Add("@locationparentid", SqlDbType.Int).Value = user.locationparentid;
                    sqlcmd.Parameters.Add("@teamid", SqlDbType.Int).Value = user.teamid;
                    sqlcmd.Parameters.Add("@teamparentid", SqlDbType.Int).Value = user.teamparentid;
                    sqlcmd.Parameters.Add("@unitid", SqlDbType.Int).Value = user.unitid;
                    sqlcmd.Parameters.Add("@unitparentid", SqlDbType.Int).Value = user.unitparentid;
                    sqlcmd.Parameters.Add("@roleid", SqlDbType.Int).Value = user.roleid;
                    sqlcmd.Parameters.Add("@appid", SqlDbType.Int).Value = user.appid;
                    sqlcmd.Parameters.Add("@status", SqlDbType.Bit).Value = user.status;
                    sqlcmd.Parameters.Add("@acceptedTerms", SqlDbType.Bit).Value = user.acceptedTerms;
                    sqlcmd.Parameters.Add("@firstTimeLogin", SqlDbType.DateTime).Value = user.firstTimeLogin;
                    sqlcmd.Parameters.Add("@createdby", SqlDbType.Int).Value = user.createdby;
                    // sqlcmd.Parameters.Add("@createddate", SqlDbType.DateTime).Value = Convert.ToDateTime(user.createddate);
                    //sqlcmd.Parameters.Add("@modifiedby", SqlDbType.Int).Value = user.modifiedby;
                    // sqlcmd.Parameters.Add("@modifieddate", SqlDbType.DateTime).Value = Convert.ToDateTime(user.modifieddate);
                    // sqlcmd.Parameters.Add("@timestamp", SqlDbType.Timestamp).Value = user.timestamp;
                    // sqlcmd.Parameters.Add("@SaltValue", SqlDbType.VarChar, 5000).Value = user.SaltValue;

                    sqlcmd.ExecuteNonQuery();
                    return new Result
                    {

                        Results = (sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int32)sqlcmd.Parameters["@UserID"].Value)
                    };
                    logger.Debug("Save Data");
                }
            }
        }
        public Result UpdateUser(UserDetails user)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    sqlcmd.CommandText = "security.usp_UpdateUser";
                    sqlcmd.Connection = conn;
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@userid", SqlDbType.Int).Value = user.userid; ;
                    sqlcmd.Parameters.Add("@insertedSuccesfully", SqlDbType.Int).Direction = ParameterDirection.Output;
                    sqlcmd.Parameters.Add("@clientid", SqlDbType.Int).Value = user.clientid;
                    sqlcmd.Parameters.Add("@emailaddress", SqlDbType.VarChar, 50).Value = user.emailaddress;
                    sqlcmd.Parameters.Add("@firstname", SqlDbType.VarChar, 50).Value = user.firstname;
                    sqlcmd.Parameters.Add("@lastname", SqlDbType.VarChar, 50).Value = user.lastname;
                    sqlcmd.Parameters.Add("@password", SqlDbType.VarChar, 5000).Value = user.password;
                    sqlcmd.Parameters.Add("@middleinitial", SqlDbType.VarChar, 100).Value = user.middleinitial;
                    sqlcmd.Parameters.Add("@workerid", SqlDbType.VarChar, 50).Value = user.workerid;
                    sqlcmd.Parameters.Add("@hrparentid", SqlDbType.Int).Value = user.hrparentid;
                    sqlcmd.Parameters.Add("@supervisorid", SqlDbType.Int).Value = user.supervisorid;
                    sqlcmd.Parameters.Add("@locationid", SqlDbType.Int).Value = user.locationid;
                    sqlcmd.Parameters.Add("@locationparentid", SqlDbType.Int).Value = user.locationparentid;
                    sqlcmd.Parameters.Add("@teamid", SqlDbType.Int).Value = user.teamid;
                    sqlcmd.Parameters.Add("@teamparentid", SqlDbType.Int).Value = user.teamparentid;
                    sqlcmd.Parameters.Add("@unitid", SqlDbType.Int).Value = user.unitid;
                    sqlcmd.Parameters.Add("@unitparentid", SqlDbType.Int).Value = user.unitparentid;
                    sqlcmd.Parameters.Add("@roleid", SqlDbType.Int).Value = user.roleid;
                    sqlcmd.Parameters.Add("@appid", SqlDbType.Int).Value = user.appid;
                    sqlcmd.Parameters.Add("@status", SqlDbType.Bit).Value = user.status;
                    sqlcmd.Parameters.Add("@acceptedTerms", SqlDbType.Bit).Value = user.acceptedTerms;
                    sqlcmd.Parameters.Add("@firstTimeLogin", SqlDbType.DateTime).Value = user.firstTimeLogin;
                    //sqlcmd.Parameters.Add("@createdby", SqlDbType.Int).Value = user.createdby;
                    // sqlcmd.Parameters.Add("@createddate", SqlDbType.DateTime).Value = Convert.ToDateTime(user.createddate);
                    sqlcmd.Parameters.Add("@modifiedby", SqlDbType.Int).Value = user.modifiedby;
                    //  sqlcmd.Parameters.Add("@modifieddate", SqlDbType.DateTime).Value = Convert.ToDateTime(user.modifieddate);
                    // sqlcmd.Parameters.Add("@timestamp", SqlDbType.Timestamp).Value = user.timestamp;
                    sqlcmd.Parameters.Add("@SaltValue", SqlDbType.VarChar, 5000).Value = user.SaltValue;

                    sqlcmd.ExecuteNonQuery();
                    return new Result
                    {
                        // MessageId = Convert.ToInt32(sqlcmd.Parameters["@MessageID"].Value),
                        //Status = Convert.ToBoolean(sqlcmd.Parameters["@Status"].Value),

                        Results = (sqlcmd.Parameters["@insertedSuccesfully"].Value == DBNull.Value ? 0 : (Int32)sqlcmd.Parameters["@insertedSuccesfully"].Value)

                    };
                }
            }
        }


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
        public UserDetails IsValidUser(String emailaddress, String userPassword)
        {
            UserDetails objUser = null;
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_IsValidUser";
                    sqlcmd.Connection = conn;
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@emailaddress", SqlDbType.NVarChar, 100).Value = emailaddress;
                    sqlcmd.Parameters.Add("@userPassword", SqlDbType.NVarChar, 100).Value = userPassword;
                    sqlad.Fill(ds);
                    //int attempts;
                    //if (ds != null)
                    //{
                    //    if (ds.Tables[0].Rows.Count > 0)
                    //    {
                    //        UserDetails user = new UserDetails();
                    //       // attempts = Convert.ToInt32(ViewState["attempts"]);
                    //       // attempts = Convert.ToInt32(ds.Tables[0].Rows[0]["AttemptCount"]);
                    //        SqlDataAdapter sqlada = new SqlDataAdapter(sqlcmd);
                    //        DataSet dsa = new DataSet();
                    //        sqlcmd.CommandText = "SecurityLoginAttempts";
                    //        sqlcmd.Connection = conn;
                    //        sqlcmd.CommandType = CommandType.StoredProcedure;
                    //        sqlcmd.Parameters.Add("@LoginTime", SqlDbType.NVarChar, 100).Value = DateTime.Now.ToString();
                    //        sqlcmd.Parameters.Add("@LoginStatus", SqlDbType.NVarChar, 100).Value = "Active";
                    //        sqlcmd.Parameters.Add("@AttemptCount", SqlDbType.NVarChar, 100).Value = 1;
                    //        int i= sqlcmd.ExecuteNonQuery();
                    //        //sqlcmd.Parameters.Add("@userPassword", SqlDbType.NVarChar, 100).Value = userPassword;

                    //    }

                    //}
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {

                        
                        //for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                        //{
                        objUser = new UserDetails();
                        objUser.userid = Convert.ToInt32(ds.Tables[0].Rows[0]["userid"].ToString());
                        objUser.password = ds.Tables[0].Rows[0]["Password"].ToString();
                        objUser.roleid = Convert.ToInt32(ds.Tables[0].Rows[0]["roleid"]);
                        objUser.firstname = ds.Tables[0].Rows[0]["firstname"].ToString();
                        objUser.lastname = ds.Tables[0].Rows[0]["lastname"].ToString();
                        objUser.RoleName = ds.Tables[0].Rows[0]["description"].ToString();
                        //}
                    }
                }
            }
            return objUser;
        }
        public Result GetRole()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    UserDetails user = new UserDetails();
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetRole";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    //sqlcmd.Parameters.Add("@Keyword", SqlDbType.NVarChar, 200).Value = keyword;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        user = new UserDetails();

                        //user.Role = ds.Tables[0].Rows[0]["RoleName"].ToString();
                        //user.RoleID =Convert.ToInt32(ds.Tables[0].Rows[0]["RoleID"].ToString());
                        //user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
                        // user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
                        //  user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
                        return new Result
                        {
                            //Results = new
                            //{
                            Results = ds.Tables[0],
                            // }
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

        public Result getMenubyUserRole(string UserRole)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "USP_MenubyUserRole_Select";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = UserRole;
                    // sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuName;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        user = new UserDetails();
                        user.userid = Convert.ToInt32(ds.Tables[0].Rows[0]["userid"].ToString());
                        user.lastname = ds.Tables[0].Rows[0]["LastName"].ToString();
                        user.emailaddress = ds.Tables[0].Rows[0]["emailaddress"].ToString();
                        user.password = ds.Tables[0].Rows[0]["Password"].ToString();
                        //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                        //if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
                        //    user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                        //if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
                        //  user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();

                        user.workerid = ds.Tables[0].Rows[0]["workerid"].ToString();
                        //return new Result
                        //{
                        //    Results = user
                        //};
                    }
                    return new Result
                    {
                        // Status = false,
                        // MessageId = 1,
                        // Results = null
                    };
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
