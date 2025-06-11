using System.Runtime.Serialization;

namespace CareerCloud.BusinessLogicLayer
{
    public class ValidationException : Exception
    {              
        public ValidationException(int code, string message)
            : base(message)   
        {
            Code = code;    
        }
        public int Code { get; }
    }
}
