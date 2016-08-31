using DummyProjectStateClass;
using Newtonsoft.Json;
using RedisConnectionTest;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace DummyProjectDAL
{
 public static   class CommonFunctions
    {
        #region Fields

        private static byte[] key = { };
        private static byte[] IV = { 38, 55, 206, 48, 28, 64, 20, 16 };
        private static string stringKey = "@!#$^3470789";

        #endregion

        #region Public Methods

        public static string Encrypt(string text)
        {
            try
            {
                key = Encoding.UTF8.GetBytes(stringKey.Substring(0, 8));
                DESCryptoServiceProvider des = new DESCryptoServiceProvider();
                Byte[] byteArray = Encoding.UTF8.GetBytes(text);
                MemoryStream memoryStream = new MemoryStream();
                CryptoStream cryptoStream = new CryptoStream(memoryStream, des.CreateEncryptor(key, IV), CryptoStreamMode.Write);
                cryptoStream.Write(byteArray, 0, byteArray.Length);
                cryptoStream.FlushFinalBlock();
                return Convert.ToBase64String(memoryStream.ToArray());
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return string.Empty;
        }
        public static string Decrypt(string text)
        {
            try
            {
                key = Encoding.UTF8.GetBytes(stringKey.Substring(0, 8));
                DESCryptoServiceProvider des = new DESCryptoServiceProvider();
                Byte[] byteArray = Convert.FromBase64String(text);
                MemoryStream memoryStream = new MemoryStream();
                CryptoStream cryptoStream = new CryptoStream(memoryStream, des.CreateDecryptor(key, IV), CryptoStreamMode.Write);
                cryptoStream.Write(byteArray, 0, byteArray.Length);
                cryptoStream.FlushFinalBlock();
                return Encoding.UTF8.GetString(memoryStream.ToArray());
            }
            catch (Exception ex)
            {
                throw ex;
                // System.Web.HttpContext.Current.Response.Redirect("");
            }
            return string.Empty;
        }
        public static string MD5Encryption(string strVal)
        {
            try
            {
                MD5CryptoServiceProvider md5Hasher = new MD5CryptoServiceProvider();
                byte[] hashBytes;
                UTF8Encoding encoder = new UTF8Encoding();
                hashBytes = md5Hasher.ComputeHash(encoder.GetBytes(strVal));
                String retStr = "";
                foreach (byte b in hashBytes)
                {
                    retStr = retStr + b.ToString("X2");
                }
                //return retStr.ToLower();
                return retStr;
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        #endregion


        public static string killChars(string strWords)
        {
            string newChars;

            string[] badChars = { "select", "drop", "--", "insert", "script", "alert", "union", "alter", "update", "null", "having", "onmouseover", "onclick", "onsubmit", "onblur", "truncate", "=", "delete", "xp_", "'", "&nbsp;" };
            newChars = strWords;

            int i;
            for (i = 0; i < badChars.Length; i++)
            {
                newChars = Regex.Replace(newChars, badChars[i], "");
            }
            return newChars;

        }

        public static int expiryafteraddingseconds(int addseconds)
        {
            var unixEpoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var expiry = Math.Round((DateTime.UtcNow.AddSeconds(Convert.ToDouble(ConfigurationManager.AppSettings["AuthTokenExpiry"])) - unixEpoch).TotalSeconds);
            return Convert.ToInt32(expiry);
        }

        #region  redis
        public static bool IsKeyexistsinRedis(string key)
        {

            var cache = RedisConnectorHelper.Connection.GetDatabase();
            var value = cache.KeyExists(key);
            return value;
        }

        public static Result ReturnUserProfileCache(string key,string password)
        {
            Result finalresult = new Result();
            var cache = RedisConnectorHelper.Connection.GetDatabase();
            var value = cache.StringGet(key);
            string result = value.ToString();
            dynamic obj = JsonConvert.DeserializeObject(result);

            if (password == Convert.ToString(obj.encryptedpassword))
            {
                finalresult.firstname = Convert.ToString(obj.firstname);
                finalresult.lastname = Convert.ToString(obj.lastname);
                finalresult.UserID = Convert.ToInt32(obj.UserID);
                finalresult.RoleID = Convert.ToString(obj.RoleID);
                finalresult.emailaddress = Convert.ToString(obj.emailaddress);
                DateTime dt = Convert.ToDateTime(obj.issuedat);
                dt = dt.AddMinutes(5);
                finalresult.issuedat = Convert.ToDateTime(obj.issuedat);
                finalresult.expirydate = dt;
                finalresult.Expirydate =dt;
                //finalresult.Expirydate =CommonFunctions.FromUnixTime(long.Parse(dt.ToString()));
                finalresult.clientid = Convert.ToInt32(obj.clientid);
                finalresult.token = Convert.ToString(obj.token);
                finalresult.encryptedpassword = Convert.ToString(obj.encryptedpassword);
                finalresult.Status = Convert.ToString((int)HttpStatusCode.OK);
            }
            else
            {

            }


            return finalresult;
        }

        public static TokenDetails ReturnTokenCache(string key)
        {
            TokenDetails finalresult = new TokenDetails();
            var cache = RedisConnectorHelper.Connection.GetDatabase();
            var value = cache.StringGet(key);
            string result = value.ToString();
            dynamic obj = JsonConvert.DeserializeObject(result);
            finalresult.expirydate = Convert.ToInt32(obj.expirydate);
            finalresult.token = Convert.ToString(obj.token);
            return finalresult;
        }

        public static Result ReturnUserProfileCache_withoutpass(string key)
        {
            Result finalresult = new Result();
            var cache = RedisConnectorHelper.Connection.GetDatabase();
            var value = cache.StringGet(key);
            string result = value.ToString();
            dynamic obj = JsonConvert.DeserializeObject(result);

           
                finalresult.firstname = Convert.ToString(obj.firstname);
                finalresult.lastname = Convert.ToString(obj.lastname);
                finalresult.UserID = Convert.ToInt32(obj.UserID);
                finalresult.RoleID = Convert.ToString(obj.RoleID);
                finalresult.emailaddress = Convert.ToString(obj.emailaddress);
                DateTime dt = Convert.ToDateTime(obj.issuedat);
                dt = dt.AddMinutes(5);
                finalresult.issuedat = Convert.ToDateTime(obj.issuedat);
                finalresult.expirydate = dt;
                finalresult.clientid = Convert.ToInt32(obj.clientid);
                finalresult.token = Convert.ToString(obj.token);
                finalresult.encryptedpassword = Convert.ToString(obj.encryptedpassword);
                finalresult.Status = Convert.ToString((int)HttpStatusCode.OK);
         


            return finalresult;
        }

        public static bool CreateRedisKeyValue(string Key,string value)
        {
            var cache = RedisConnectorHelper.Connection.GetDatabase();
            cache.StringSet(Key, value);
            return true;
        }

        public static DateTime FromUnixTime(long unixTime)
        {
            var epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            return epoch.AddSeconds(unixTime);
        }
        #endregion

    }
}
