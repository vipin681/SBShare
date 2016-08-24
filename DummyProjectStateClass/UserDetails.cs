using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectStateClass
{
    public class UserDetails: BaseClass
    {
        public Int32 userid { get; set; }
        public string emailaddress { get; set; }
        public String firstname { get; set; }
        public String lastname { get; set; }
        public String RoleName { get; set; }
        public String middleinitial { get; set; }
        public String password { get; set; }
        public String workerid { get; set; }
        public Int32 hrparentid { get; set; }
        public Int32 supervisorid { get; set; }
        public Int32 locationid { get; set; }
        public Int32 locationparentid { get; set; }
        public Int32 teamid { get; set; }
        public Int32 teamparentid { get; set; }
        public Int32 unitid { get; set; }
        public Int32 unitparentid { get; set; }
        public Int32 roleid { get; set; }
        public Int32 appid { get; set; }
        public bool acceptedTerms { get; set; }
        public DateTime firstTimeLogin { get; set; }
        public String SaltValue { get; set; }
        public bool FirstTimeLogin_YN { get; set; }
        public int themeid { get; set; }

















        //public UserDetails()
        //{
        //    country = new Country();
        //    role = new Role();
        ////        UserToken = new UserToken();
        ////        //UserRoleAccessMapList = new List<UserRoleAccessMap>();

        //}
    }
}
