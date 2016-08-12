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
            //SqlConnection con = new SqlConnection("Data Source=piyush1;Initial Catalog=Test;Integrated Security=true");
           string connectionString = ConfigurationSettings.AppSettings["ConStr"];
            SqlConnection conn = new SqlConnection(connectionString);
            conn.Open();
            return conn;
        }
    }
}
