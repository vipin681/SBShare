using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectStateClass
{
 public   class UpdateUserPassword
    {
        public Int64 userid { get; set; }
        public String Password { get; set; }
        public Nullable<Int64> modifiedby { get; set; }
        public DateTime modifieddate { get; set; }
        public Int32 ClientId { get; set; }
    }
}
