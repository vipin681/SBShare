using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;


namespace DummyProjectDAL
{
    public  static class CommonFunctions
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
            catch(Exception ex)
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

    }
}
