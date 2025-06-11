﻿using CareerCloud.DataAccessLayer;
using CareerCloud.BusinessLogicLayer;

namespace CareerCloud.Pocos
{    
    public class ApplicantEducationLogic : BaseLogic<ApplicantEducationPoco>
    {        
        public ApplicantEducationLogic(IDataRepository<ApplicantEducationPoco> repository)
            : base(repository)
        {
        }
        protected override void Verify(ApplicantEducationPoco[] pocos)
        {
            //Rules Code: 107, 108, 109
            List<ValidationException> exceptions = new List<ValidationException>();
            foreach (ApplicantEducationPoco poco in pocos)
            {
                if (string.IsNullOrEmpty(poco.Major))
                {
                    exceptions.Add(new ValidationException(107, "Major field cannot be null"));
                }
                else if (poco.Major.Length < 3)
                {
                    exceptions.Add(new ValidationException(107, "Major field cannot be of less than 3 characters."));
                }

                if (poco.StartDate > DateTime.Now)
                {
                    exceptions.Add(new ValidationException(108, $"Start date for {poco.Id} cannot be greater than today's date."));
                }

                if (poco.CompletionDate < poco.StartDate)
                {
                    exceptions.Add(new ValidationException(109, $"Completion date for {poco.Id} cannot be earlier than the start date."));
                }
            }
         
            if (exceptions.Count > 0)
            {
                throw new AggregateException(exceptions);
            }
        }
        public override void Add(ApplicantEducationPoco[] pocos)
        {            
            Verify(pocos);
            base.Add(pocos);
        }

        public override void Update(ApplicantEducationPoco[] pocos)
        {            
            Verify(pocos);
            base.Update(pocos);
        }
    }
}
