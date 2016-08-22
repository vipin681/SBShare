using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectStateClass
{
    public static class EnumClass
    {
        public enum APIName
        {
            [Display(Name = "GetUserList")]
            GetUserList = 1,

            [Display(Name = "GetUserById")]
            GetUserById = 2,

            [Display(Name = "GetSearchResult")]
            GetSearchResult =3,

            [Display(Name = "SaveUserDetails")]
            SaveUserDetails =4,

            [Display(Name = "EditUserDetails")]
            EditUserDetails =5,

            [Display(Name = "CheckLogin")]
            CheckLogin =6,

            [Display(Name = "UpdatePassword")]
            UpdatePassword =7,

            [Display(Name = "RefreshToken")]
            RefreshToken = 8,
        };

        public static T GetValueFromDescription<T>(string description)
        {
            var type = typeof(T);
            if (!type.IsEnum) throw new InvalidOperationException();
            foreach (var field in type.GetFields())
            {
                var attribute = Attribute.GetCustomAttribute(field,
                    typeof(DescriptionAttribute)) as DescriptionAttribute;
                if (attribute != null)
                {
                    if (attribute.Description == description)
                        return (T)field.GetValue(null);
                }
                else
                {
                    if (field.Name == description)
                        return (T)field.GetValue(null);
                }
            }
            throw new ArgumentException("Not found.", "description");
            // or return default(T);
        }
    }
}
