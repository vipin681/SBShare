
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.ExceptionHandling;
using NLog;
using System.Text;
using System.Net.Http;

namespace DummyProject.Filters
{
    public class ExceptionHandling:ExceptionLogger
    {
        private static readonly Logger NLog = LogManager.GetCurrentClassLogger();
        public override void Log(ExceptionLoggerContext context)
        {
            NLog.LogException(LogLevel.Error, RequestToString(context.Request), context.Exception);
          //  base.Log(context);
        }
        private static string RequestToString(HttpRequestMessage request)
        {
            var message = new StringBuilder();
            if (request.Method != null)
                message.Append(request.Method);

            if (request.RequestUri != null)
                message.Append(" ").Append(request.RequestUri);

            return message.ToString();
        }

    }
}