using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DummyProjectStateClass;
using System.Data.SqlClient;
using System.Data;

namespace DummyProjectDAL
{
    public class UserDAL
    {
        public Result InsertUser(UserDetails user)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    sqlcmd.CommandText = "usp_InsertUser";
                    sqlcmd.Connection = conn;
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@UserID", SqlDbType.BigInt).Direction = ParameterDirection.Output;
                    sqlcmd.Parameters.Add("@UserName", SqlDbType.NVarChar, 50).Value = (user.UserName == "null" ? DBNull.Value.ToString() : user.UserName);
                    sqlcmd.Parameters.Add("@Password", SqlDbType.NVarChar, 20).Value = user.Password;
                    sqlcmd.Parameters.Add("@LastName", SqlDbType.NVarChar, 40).Value = user.LastName;
                    sqlcmd.Parameters.Add("@Phone", SqlDbType.NVarChar, 20).Value = user.Phone;
                    sqlcmd.Parameters.Add("@Email", SqlDbType.NVarChar, 50).Value = user.Email;
                    sqlcmd.Parameters.Add("@SaltValue", SqlDbType.NVarChar, 50).Value = user.SaltValue;
                    sqlcmd.Parameters.Add("@CountryId", SqlDbType.NVarChar, 50).Value = user.CountryId;
                    sqlcmd.Parameters.Add("@RoleId", SqlDbType.NVarChar, 50).Value = user.RoleID;
                   // sqlcmd.Parameters.Add("@IsActice", SqlDbType.Bit).Value = user.IsActice;
                    sqlcmd.Parameters.Add("@InsertedBy", SqlDbType.BigInt).Value = 2;
                    sqlcmd.ExecuteNonQuery();
                    return new Result
                    {

                        Results = (sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                    };
                }
            }
        }
        public Result UpdateUser(UserDetails user)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    sqlcmd.CommandText = "usp_UpdateUser";
                    sqlcmd.Connection = conn;
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                  //  sqlcmd.Parameters.Add("@Status", SqlDbType.BigInt).Direction = ParameterDirection.Output;
                  //  sqlcmd.Parameters.Add("@MessageID", SqlDbType.BigInt).Direction = ParameterDirection.Output;
                    sqlcmd.Parameters.Add("@UserID", SqlDbType.BigInt).Value = user.ID;
                    sqlcmd.Parameters.Add("@UserName", SqlDbType.NVarChar, 150).Value = user.UserName;
                    sqlcmd.Parameters.Add("@Password", SqlDbType.NVarChar, 50).Value = user.Password;
                    sqlcmd.Parameters.Add("@Email", SqlDbType.NVarChar, 50).Value = user.Email;
                    sqlcmd.Parameters.Add("@Phone", SqlDbType.NVarChar, 50).Value = user.Phone;
                    sqlcmd.Parameters.Add("@CountryId", SqlDbType.NVarChar, 50).Value = user.CountryId;
                    sqlcmd.Parameters.Add("@RoleID", SqlDbType.NVarChar, 50).Value = user.RoleID;
                    
                    sqlcmd.Parameters.Add("@InsertedBy", SqlDbType.Bit).Value = 2;
                   
                    sqlcmd.ExecuteNonQuery();
                    return new Result
                    {
                       // MessageId = Convert.ToInt32(sqlcmd.Parameters["@MessageID"].Value),
                        //Status = Convert.ToBoolean(sqlcmd.Parameters["@Status"].Value),
                   
                        Results = (sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                    };
                }
            }
        }
        public Result Updatepassword(UserDetails user)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    sqlcmd.CommandText = "UpdateUserPassword";
                    sqlcmd.Connection = conn;
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@paramuserid", SqlDbType.BigInt).Value = user.ID;
                    sqlcmd.Parameters.Add("@paramnewPassword", SqlDbType.NVarChar, 150).Value = user.Password;
                    sqlcmd.Parameters.Add("@modifiedby", SqlDbType.Bit).Value = user.ID;
                    sqlcmd.ExecuteNonQuery();
                    return new Result
                    {
                       Results = (sqlcmd.Parameters["@paramuserid"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@paramuserid"].Value)
                    };
                }
            }
        }
        public Result GetUserDetailsByID(Int64 ID)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetUserDetailsByID";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = ID;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        user = new UserDetails();
                        user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
                        user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
                        user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
                        user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
                        user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
                        user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
                        //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                        if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
                            user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                        if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
                            user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
                        if (ds.Tables[0].Rows[0]["RoleID"] != DBNull.Value)
                            user.role.RoleID =Convert.ToInt32( ds.Tables[0].Rows[0]["RoleID"].ToString());

                        if (ds.Tables[0].Rows[0]["RoleName"] != DBNull.Value)
                            user.role.RoleName = ds.Tables[0].Rows[0]["RoleName"].ToString();
                        user.WorkerID =ds.Tables[0].Rows[0]["WorkerID"].ToString();
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
        public Result GetUserList()
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetUserList";
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
                        Status = false,
                        MessageId = 1,
                        Results = null
                    };
                }
            }
        }
        public Result GetUserListByID(String keyword)
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
                    sqlcmd.Parameters.Add("@keyword", SqlDbType.NVarChar, 200).Value = keyword;
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
        public UserDetails IsValidUser(String userName, String userPassword)
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
                    sqlcmd.Parameters.Add("@userName", SqlDbType.NVarChar, 100).Value = userName;
                    sqlcmd.Parameters.Add("@userPassword", SqlDbType.NVarChar, 100).Value = userPassword;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        for (int i = 0; i < ds.Tables[0].Rows.Count; i++)
                        {
                            objUser = new UserDetails();
                            objUser.ID = Convert.ToInt64(ds.Tables[0].Rows[i]["ID"].ToString());
                            objUser.UserName = ds.Tables[0].Rows[i]["UserName"].ToString();
                            objUser.Password = ds.Tables[0].Rows[i]["Password"].ToString();
                            objUser.TokenID = ds.Tables[0].Rows[i]["TokenID"].ToString();
                        }
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


        public Result GetMenuCRUDSelect(string menuID, string menuName)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetUserDetailsByID";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuID;
                    sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuName;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        user = new UserDetails();
                        user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
                        user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
                        user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
                        user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
                        user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
                        user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
                        //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                        if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
                            user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                        if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
                            user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
                        if (ds.Tables[0].Rows[0]["RoleID"] != DBNull.Value)
                            user.role.RoleID = Convert.ToInt32(ds.Tables[0].Rows[0]["RoleID"].ToString());

                        if (ds.Tables[0].Rows[0]["RoleName"] != DBNull.Value)
                            user.role.RoleName = ds.Tables[0].Rows[0]["RoleName"].ToString();
                        user.WorkerID = ds.Tables[0].Rows[0]["WorkerID"].ToString();
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


        public Result getUserRoleDetails(string UserRole)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                UserDetails user = null;
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    SqlDataAdapter sqlad = new SqlDataAdapter(sqlcmd);
                    DataSet ds = new DataSet();
                    sqlcmd.CommandText = "usp_GetUserDetailsByID";
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Connection = conn;
                    sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = UserRole;
                   // sqlcmd.Parameters.Add("@ID", SqlDbType.BigInt).Value = menuName;
                    sqlad.Fill(ds);
                    if (ds != null && ds.Tables.Count > 0 && ds.Tables[0].Rows.Count > 0)
                    {
                        user = new UserDetails();
                        user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
                        user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
                        user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
                        user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
                        user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
                        user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
                        //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                        if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
                            user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                        if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
                            user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
                        if (ds.Tables[0].Rows[0]["RoleID"] != DBNull.Value)
                            user.role.RoleID = Convert.ToInt32(ds.Tables[0].Rows[0]["RoleID"].ToString());

                        if (ds.Tables[0].Rows[0]["RoleName"] != DBNull.Value)
                            user.role.RoleName = ds.Tables[0].Rows[0]["RoleName"].ToString();
                        user.WorkerID = ds.Tables[0].Rows[0]["WorkerID"].ToString();
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
                        user.ID = Convert.ToInt64(ds.Tables[0].Rows[0]["ID"].ToString());
                        user.UserName = ds.Tables[0].Rows[0]["UserName"].ToString();
                        user.LastName = ds.Tables[0].Rows[0]["LastName"].ToString();
                        user.Phone = ds.Tables[0].Rows[0]["Phone"].ToString();
                        user.Email = ds.Tables[0].Rows[0]["Email"].ToString();
                        user.Password = ds.Tables[0].Rows[0]["Password"].ToString();
                        //(sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                        if (ds.Tables[0].Rows[0]["CountryID"] != DBNull.Value)
                            user.country.CountryID = Convert.ToInt32(ds.Tables[0].Rows[0]["CountryID"].ToString());
                        if (ds.Tables[0].Rows[0]["CountryName"] != DBNull.Value)
                            user.country.CountryName = ds.Tables[0].Rows[0]["CountryName"].ToString();
                        if (ds.Tables[0].Rows[0]["RoleID"] != DBNull.Value)
                            user.role.RoleID = Convert.ToInt32(ds.Tables[0].Rows[0]["RoleID"].ToString());

                        if (ds.Tables[0].Rows[0]["RoleName"] != DBNull.Value)
                            user.role.RoleName = ds.Tables[0].Rows[0]["RoleName"].ToString();
                        user.WorkerID = ds.Tables[0].Rows[0]["WorkerID"].ToString();
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



        public Result insertMenu(UserDetails user)
        {
            using (SqlConnection conn = DbHelper.CreateConnection())
            {
                using (SqlCommand sqlcmd = new SqlCommand())
                {
                    sqlcmd.CommandText = "USP_Menu_Insert";
                    sqlcmd.Connection = conn;
                    sqlcmd.CommandType = CommandType.StoredProcedure;
                    sqlcmd.Parameters.Add("@UserID", SqlDbType.BigInt).Direction = ParameterDirection.Output;
                    sqlcmd.Parameters.Add("@UserName", SqlDbType.NVarChar, 50).Value = (user.UserName == "null" ? DBNull.Value.ToString() : user.UserName);
                    sqlcmd.Parameters.Add("@Password", SqlDbType.NVarChar, 20).Value = user.Password;
                    sqlcmd.Parameters.Add("@LastName", SqlDbType.NVarChar, 40).Value = user.LastName;
                    sqlcmd.Parameters.Add("@Phone", SqlDbType.NVarChar, 20).Value = user.Phone;
                    sqlcmd.Parameters.Add("@Email", SqlDbType.NVarChar, 50).Value = user.Email;
                    sqlcmd.Parameters.Add("@SaltValue", SqlDbType.NVarChar, 50).Value = user.SaltValue;
                    sqlcmd.Parameters.Add("@CountryId", SqlDbType.NVarChar, 50).Value = user.CountryId;
                    sqlcmd.Parameters.Add("@RoleId", SqlDbType.NVarChar, 50).Value = user.RoleID;
                    // sqlcmd.Parameters.Add("@IsActice", SqlDbType.Bit).Value = user.IsActice;
                    sqlcmd.Parameters.Add("@InsertedBy", SqlDbType.BigInt).Value = 2;
                    sqlcmd.ExecuteNonQuery();
                    return new Result
                    {

                        Results = (sqlcmd.Parameters["@UserID"].Value == DBNull.Value ? 0 : (Int64)sqlcmd.Parameters["@UserID"].Value)
                    };
                }
            }
        }

    }
}
