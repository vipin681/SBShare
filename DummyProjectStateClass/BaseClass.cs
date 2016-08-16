using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectStateClass
{
    public class BaseClass
    {

        public Int32 clientid { get; set; }
        public bool status { get; set; }
        public Int32 createdby { get; set; }
        public DateTime createddate { get; set; }
        public Int32 modifiedby { get; set; }
        public DateTime modifieddate { get; set; }
        public string timestamp { get; set; }
        public String TokenID { get; set; }
    }
}
