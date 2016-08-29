using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using StackExchange.Redis;
using Newtonsoft.Json;

namespace DummyProject.Controllers
{
    public class RedisConnectorHelper
    {
        private static ConnectionMultiplexer connectionMultiplexer;
        private static IDatabase database;
        static RedisConnectorHelper()
        {
            RedisConnectorHelper.lazyConnection = new Lazy<ConnectionMultiplexer>(() =>
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
        public static bool StoreData(string key, string value)
        {
            return database.StringSet(key, value);
        }
        public static string GetData(string key)
        {
            return database.StringGet(key);
        }
        public bool Add<T>(string key, T value, DateTimeOffset expiresAt) where T : class
        {
            var serializedObject = JsonConvert.SerializeObject(value);
            var expiration = expiresAt.Subtract(DateTimeOffset.Now);

            return database.StringSet(key, serializedObject, expiration);
        }

        public T Get<T>(string key) where T : class
        {
            var serializedObject = database.StringGet(key);

            return JsonConvert.DeserializeObject<T>(serializedObject);
        }
    }
}