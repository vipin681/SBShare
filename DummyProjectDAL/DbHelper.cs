using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Data.SqlClient;
using System.Data;
using System.Configuration;
namespace DummyProjectDAL
{
  public   class DbHelper
    {
        static public SqlConnection CreateConnection()
        {
            //SqlConnection con = new SqlConnection("Data Source = piyush1; Initial Catalog = test;Integrated Security=true; Connect Timeout = 120");
           SqlConnection con = new SqlConnection("Data Source = 10.10.1.11,1433; Initial Catalog = SupportBeacon; User ID = sa; Password= admin; Connect Timeout= 120");
            //string connectionString = ConfigurationSettings.AppSettings["ConnectionString"];
            //SqlConnection conn = new SqlConnection(connectionString);
            con.Open();
            return con;
        }
    }
}
