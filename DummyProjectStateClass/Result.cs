using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectStateClass
{
    //This 
   public class Result
    {
        public string errormsg { get; set; }
        public string RoleName { get; set; }
        public string Status { get; set; }
        public int MessageId { get; set; }
        public dynamic Results { get; set; }
        public int UserID { get; set;}
        public string RoleID { get; set; }
        public int roleid { get; set; }
       // public bool status { get; set; }
        public String description { get; set; }
        public string emailaddress { get; set; }
        public string firstname { get; set; }
        public string lastname { get; set; }
        public int clientid { get; set; }
        public DateTime issuedat { get; set; }
        public DateTime expirydate { get; set; }
        public string token { get; set; }
        public string encryptedpassword { get; set; }
    }
}
