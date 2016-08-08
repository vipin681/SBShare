﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http.Filters;
using System.Web.Http.Controllers;
using System.Web.Http.Tracing;
using System.Web.Http;

namespace DummyProject.Helper
{
    public class LoggingFilter :ExceptionFilterAttribute
    {
        public override void OnException(HttpActionExecutedContext actionExecutedContext)
        {
            Elmah.ErrorLog.GetDefault(HttpContext.Current).Log(new Elmah.Error(actionExecutedContext.Exception));
        }
        //public override void OnActionExecuting(HttpActionContext filterContext)
        //{
        //    GlobalConfiguration.Configuration.Services.Replace(typeof(ITraceWriter), new NLogger());
        //    var trace = GlobalConfiguration.Configuration.Services.GetTraceWriter();
        //    trace.Info(filterContext.Request, "Controller : " + filterContext.ControllerContext.ControllerDescriptor.ControllerType.FullName + Environment.NewLine + "Action : " + filterContext.ActionDescriptor.ActionName, "JSON", filterContext.ActionArguments);
        //}
    }
}