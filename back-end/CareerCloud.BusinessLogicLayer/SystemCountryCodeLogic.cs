using CareerCloud.Pocos;
using CareerCloud.DataAccessLayer;

namespace CareerCloud.BusinessLogicLayer
{
    public class SystemCountryCodeLogic
    {
        protected IDataRepository<SystemCountryCodePoco> _repository;
        public SystemCountryCodeLogic(IDataRepository<SystemCountryCodePoco> repository)
        {
            _repository = repository;
        }
        protected void Verify(SystemCountryCodePoco[] pocos)
        {
            //Rules Code: 900, 901
            List<ValidationException> exceptions = new List<ValidationException>();
            foreach (SystemCountryCodePoco poco in pocos)
            {
                if (string.IsNullOrEmpty(poco.Code))
                {
                    exceptions.Add(new ValidationException(900, "Country Code cannot be empty."));
                }
                if (string.IsNullOrEmpty(poco.Name))
                {
                    exceptions.Add(new ValidationException(901, $"Country Name for {poco.Code} cannot be empty."));
                }
            }
             
            if (exceptions.Count > 0)
            {
                throw new AggregateException(exceptions);
            }
        }
        
        public SystemCountryCodePoco Get(string code)
        {
            return _repository.GetSingle(x => x.Code == code);
        }
        public List<SystemCountryCodePoco> GetAll()
        {
            return _repository.GetAll().ToList();
        }
        public void Add(SystemCountryCodePoco[] pocos)
        {           
            Verify(pocos);
            _repository.Add(pocos);
        }
        public void Update(SystemCountryCodePoco[] pocos)
        {            
            Verify(pocos);
            _repository.Update(pocos);
        }
        public void Delete(SystemCountryCodePoco[] pocos)
        {
            Verify(pocos);
            _repository.Remove(pocos);
        }
    }
}
