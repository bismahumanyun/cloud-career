using CareerCloud.Pocos;
using CareerCloud.DataAccessLayer;
using System.Text.RegularExpressions;

namespace CareerCloud.BusinessLogicLayer
{
    public class CompanyProfileLogic : BaseLogic<CompanyProfilePoco>
    {
        public CompanyProfileLogic(IDataRepository<CompanyProfilePoco> repository) : base(repository)
        {
        }
        protected override void Verify(CompanyProfilePoco[] pocos)
        {
            //Rules Code: 600, 601
            string phonePattern = @"^\d{3}-\d{3}-\d{4}$";
            Regex regexPhone = new Regex(phonePattern);
            string websitePattern = @"\A(?:(http)?s?:\/\/)?(www.)?([a-z0-9!]+\-?[a-z0-9!]+)+\.(ca|biz|com)\Z";
            Regex regexWebsite = new Regex(websitePattern);
            List<ValidationException> exceptions = new List<ValidationException>();
            foreach (CompanyProfilePoco poco in pocos)
            {
                //poco.CompanyWebsite = "www.aa.cam"; //for testing
                if (string.IsNullOrEmpty(poco.CompanyWebsite))
                {
                    exceptions.Add(new ValidationException(600, $"Company Website for {poco.Id} cannot be empty."));
                }
                else if (!regexWebsite.IsMatch(poco.CompanyWebsite))
                {
                    exceptions.Add(new ValidationException(600, $"You entered '{poco.CompanyWebsite}' which is an invalid website address as only .ca, .com, and .biz domains are allowed."));
                }
                //poco.ContactPhone = "437-255-2174"; //for testing
                if (string.IsNullOrEmpty(poco.ContactPhone))
                {
                    exceptions.Add(new ValidationException(601, $"Contact Phone Number is required"));
                }
                else if (!regexPhone.IsMatch(poco.ContactPhone))
                {
                    exceptions.Add(new ValidationException(601, "Contact Phone must correspond to a valid phone number (e.g., 416-555-1234)."));
                }

                if (exceptions.Count > 0)
                {
                    throw new AggregateException(exceptions);
                }
            }
        }
        public override void Add(CompanyProfilePoco[] pocos)
        {            
            Verify(pocos);
            base.Add(pocos);
        }
        public override void Update(CompanyProfilePoco[] pocos)
        {
            Verify(pocos);
            base.Update(pocos);
        }
    }
}
