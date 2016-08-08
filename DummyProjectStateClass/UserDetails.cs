using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectStateClass
{
    public class UserDetails
    {
        public Int64 ID { get; set; }
        public String UserName { get; set; }
        public String Password { get; set; }
        public String LastName { get; set; }
        public String Phone { get; set; }
        public String Email { get; set; }
        public String TokenID { get; set; }
        public String CountryId { get; set; }
        public Country country { get; set; }
        public bool IsActice { get; set;}
        public Role role { get; set; }
        public String Role { get; set; }
        public Int64 RoleID { get; set; }
        public String WorkerID { get; set; }
        public String SaltValue { get; set; }
        public Nullable<Int64> InsertedBy { get; set; }
       public string menuID { get; set; }
       public string menuName{ get; set; }
       public string parentMenuID { get; set; }
       public string UserRole { get; set; }
       public string menuFileName { get; set; }
       public string MenuURL { get; set; }
       public string UseYN { get; set; }
















        public UserDetails()
        {
            country = new Country();
            role = new Role();
        //        UserToken = new UserToken();
        //        //UserRoleAccessMapList = new List<UserRoleAccessMap>();

        }
    }
}
