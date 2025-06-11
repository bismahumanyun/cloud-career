using CareerCloud.Pocos;
using CareerCloud.DataAccessLayer;

namespace CareerCloud.BusinessLogicLayer
{
    public class SecurityLoginsRoleLogic : BaseLogic<SecurityLoginsRolePoco>
    {
        public SecurityLoginsRoleLogic(IDataRepository<SecurityLoginsRolePoco> repository) : base(repository)
        {

        }
        protected override void Verify(SecurityLoginsRolePoco[] pocos)
        {
            //Rules Code: N/A
            List<ValidationException> exceptions = new List<ValidationException>();
            foreach (SecurityLoginsRolePoco poco in pocos)
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
