﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DummyProjectStateClass
{
    public class TokenDetails
    {
        public string token { get; set; }
        public int expirydate { get; set; }
        public int userid { get; set; }
        public string encryptedpassword { get; set; }
    }
}
