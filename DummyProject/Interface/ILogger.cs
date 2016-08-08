using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Tracing;

namespace DummyProject.Interface
{

    public interface ILogger
    {
        void Debug(string message);
        void Trace(string message);
        void Info(string message);
        void Warn(string message);
        void Error(string message);
        void ErrorException(string message, Exception exception);
        void Fatal(string message);
        void Fatal(string message, Exception exception);
    }
}
