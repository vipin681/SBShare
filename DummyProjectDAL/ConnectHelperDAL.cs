using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectDAL
{
 public   class ConnectHelperDAL
    {
        private static ConnectionMultiplexer connectionMultiplexer;
        private static IDatabase database;
        static ConnectHelperDAL()
        {
            ConnectHelperDAL.lazyConnection = new Lazy<ConnectionMultiplexer>(() =>
            {
                return ConnectionMultiplexer.Connect("localhost");
                database = connectionMultiplexer.GetDatabase();
            });
        }

        private static Lazy<ConnectionMultiplexer> lazyConnection;

        public static ConnectionMultiplexer Connection
        {
            get
            {
                return lazyConnection.Value;
            }
        }
        public  string  StoreData(dynamic Data)
        {
            return "ashu";
           // return database.StringSet(Data);
        }
    }
}
