using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Http;
using DummyProject.CustomFilters;
namespace DummyProject
{
    public static class WebApiConfig
    {
        public static void Register(HttpConfiguration config)
        {
            config.MapHttpAttributeRoutes();

            config.Routes.MapHttpRoute(
                name: "DefaultApi",
                routeTemplate: "api/{controller}/{action}/{id}",
                defaults: new { id = RouteParameter.Optional }
            );
            config.Filters.Add(new OnExceptionHandler());
            config.Filters.Add(new DummyProject.CustomFilters.NotImplExceptionFilterAttribute());


        }
    }
}
