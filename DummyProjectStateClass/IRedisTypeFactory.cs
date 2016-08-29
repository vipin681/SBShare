using DummyProjectStateClass;

namespace DummyProjectStateClass
{
	public interface IRedisTypeFactory
	{
		RedisDictionary<TKey, TValue> GetDictionary<TKey, TValue>(string name);
		RedisSet<T> GetSet<T>(string name);
		RedisList<T> GetList<T>(string name);
	}
}
