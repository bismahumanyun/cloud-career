using CareerCloud.Pocos;
using CareerCloud.DataAccessLayer;

namespace CareerCloud.BusinessLogicLayer
{
    public class CompanyJobLogic : BaseLogic<CompanyJobPoco>
    {
        public CompanyJobLogic(IDataRepository<CompanyJobPoco> repository) : base(repository)
        {

        }
        protected override void Verify(CompanyJobPoco[] pocos)
        {
            //Rules Code: N/A
            List<ValidationException> exceptions = new List<ValidationException>();
            foreach (CompanyJobPoco poco in pocos)
            {
                //will be implemenetd in the future if require 
            }

            if (exceptions.Count > 0)
            {
                throw new AggregateException(exceptions);
            }
        }       
    }
}
