using CareerCloud.Pocos;
using CareerCloud.DataAccessLayer;

namespace CareerCloud.BusinessLogicLayer
{
    public class SecurityLoginsLogLogic : BaseLogic<SecurityLoginsLogPoco>
    {
        public SecurityLoginsLogLogic(IDataRepository<SecurityLoginsLogPoco> repository) : base(repository)
        {

        }
        protected override void Verify(SecurityLoginsLogPoco[] pocos)
        {
            //Rules Code: N/A
            List<ValidationException> exceptions = new List<ValidationException>();
            foreach (SecurityLoginsLogPoco poco in pocos)
            {
                //will be implemented in the future if require
            }

            if (exceptions.Count > 0)
            {
                throw new AggregateException(exceptions);
            }
        } 
    }
}
