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
            SqlConnection con = new SqlConnection("Data Source = VIPIN1; Initial Catalog = test; User ID = sa; Password = 123456; Connect Timeout = 120");
            //string connectionString = ConfigurationSettings.AppSettings["ConnectionString"];
            //SqlConnection conn = new SqlConnection(connectionString);
            con.Open();
            return con;
        }
    }
}
