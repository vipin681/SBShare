using System;

namespace DummyProjectBAL
{
	public class SignatureVerificationException : Exception
	{
		public SignatureVerificationException(string message)
			: base(message)
		{
		}
	}
}