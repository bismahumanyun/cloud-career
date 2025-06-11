import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DataTable, TableColumn, TableAction } from '../common/DataTable';
import { FormModal } from '../common/FormModal';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useApi, useApiList } from '../../hooks/useApi';
import { applicantWorkHistoryService, systemCountryCodeService } from '../../services/api';
import { ApplicantWorkHistory } from '../../types/entities';
import { Edit, Trash2, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../ui/alert-dialog';

const workHistorySchema = z.object({
  applicant: z.string().min(1, 'Applicant ID is required'),
  companyName: z.string().min(1, 'Company name is required'),
  countryCode: z.string().min(1, 'Country is required'),
  location: z.string().optional(),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobDescription: z.string().optional(),
  startMonth: z.number().min(1).max(12),
  startYear: z.number().min(1900).max(new Date().getFullYear()),
  endMonth: z.number().min(1).max(12).optional(),
  endYear: z.number().min(1900).max(new Date().getFullYear() + 1).optional(),
});

type WorkHistoryFormData = z.infer<typeof workHistorySchema>;

const months = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

export function ApplicantWorkHistoryPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingWorkHistory, setEditingWorkHistory] = useState<ApplicantWorkHistory | null>(null);
  const [deletingWorkHistory, setDeletingWorkHistory] = useState<ApplicantWorkHistory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // API hooks
  const workHistoryApi = useApiList(applicantWorkHistoryService.getAll);
  const countriesApi = useApiList(systemCountryCodeService.getAll);
  const createApi = useApi(applicantWorkHistoryService.create, {
    showSuccessToast: true,
    successMessage: 'Work history created successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      workHistoryApi.refresh();
      form.reset();
    },
  });
  const updateApi = useApi(applicantWorkHistoryService.update, {
    showSuccessToast: true,
    successMessage: 'Work history updated successfully',
    onSuccess: () => {
      setIsFormOpen(false);
      setEditingWorkHistory(null);
      workHistoryApi.refresh();
      form.reset();
    },
  });
  const deleteApi = useApi(applicantWorkHistoryService.delete, {
    showSuccessToast: true,
    successMessage: 'Work history deleted successfully',
    onSuccess: () => {
      setDeletingWorkHistory(null);
      workHistoryApi.refresh();
    },
  });

  // Form setup
  const form = useForm<WorkHistoryFormData>({
    resolver: zodResolver(workHistorySchema),
    defaultValues: {
      applicant: '',
      companyName: '',
      countryCode: '',
      location: '',
      jobTitle: '',
      jobDescription: '',
      startMonth: new Date().getMonth() + 1,
      startYear: new Date().getFullYear(),
      endMonth: undefined,
      endYear: undefined,
    },
  });

  // Load countries on mount
  useEffect(() => {
    countriesApi.execute();
  }, []);

  // Filter work history based on search term
  const filteredWorkHistory = workHistoryApi.data.filter(work =>
    work.applicant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    work.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Table columns
  const columns: TableColumn<ApplicantWorkHistory>[] = [
    {
      key: 'applicant',
      label: 'Applicant',
      sortable: true,
    },
    {
      key: 'companyName',
      label: 'Company',
      sortable: true,
    },
    {
      key: 'jobTitle',
      label: 'Job Title',
      sortable: true,
    },
    {
      key: 'location',
      label: 'Location',
      render: (value, item) => {
        const country = countriesApi.data.find(c => c.code === item.countryCode);
        const location = value ? `${value}, ` : '';
        return `${location}${country?.name || item.countryCode}`;
      },
    },
    {
      key: 'startYear',
      label: 'Start',
      render: (value, item) => {
        const month = months.find(m => m.value === item.startMonth)?.label.slice(0, 3);
        return `${month} ${value}`;
      },
    },
    {
      key: 'endYear',
      label: 'End',
      render: (value, item) => {
        if (!value || !item.endMonth) return 'Present';
        const month = months.find(m => m.value === item.endMonth)?.label.slice(0, 3);
        return `${month} ${value}`;
      },
    },
    {
      key: 'timeStamp',
      label: 'Added',
      render: (value) => new Date(value).toLocaleDateString(),
    },
  ];

  // Table actions
  const actions: TableAction<ApplicantWorkHistory>[] = [
    {
      label: 'Edit',
      icon: Edit,
      onClick: (workHistory) => {
        setEditingWorkHistory(workHistory);
        form.reset({
          applicant: workHistory.applicant,
          companyName: workHistory.companyName,
          countryCode: workHistory.countryCode,
          location: workHistory.location || '',
          jobTitle: workHistory.jobTitle,
          jobDescription: workHistory.jobDescription || '',
          startMonth: workHistory.startMonth,
          startYear: workHistory.startYear,
          endMonth: workHistory.endMonth || undefined,
          endYear: workHistory.endYear || undefined,
        });
        setIsFormOpen(true);
      },
    },
    {
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: (workHistory) => setDeletingWorkHistory(workHistory),
    },
  ];

  const handleSubmit = async (data: WorkHistoryFormData) => {
    const workHistoryData = {
      ...data,
      endMonth: data.endMonth || null,
      endYear: data.endYear || null,
    };

    if (editingWorkHistory) {
      await updateApi.execute(editingWorkHistory.id, workHistoryData);
    } else {
      await createApi.execute(workHistoryData);
    }
  };

  const handleDelete = async () => {
    if (deletingWorkHistory) {
      await deleteApi.execute(deletingWorkHistory.id);
    }
  };

  const openAddForm = () => {
    setEditingWorkHistory(null);
    form.reset({
      applicant: '',
      companyName: '',
      countryCode: '',
      location: '',
      jobTitle: '',
      jobDescription: '',
      startMonth: new Date().getMonth() + 1,
      startYear: new Date().getFullYear(),
      endMonth: undefined,
      endYear: undefined,
    });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applicant Work History</h1>
        <p className="text-gray-600">Manage employment history and professional experience</p>
      </div>

      <DataTable
        title="Work History"
        data={filteredWorkHistory}
        columns={columns}
        actions={actions}
        onAdd={openAddForm}
        onSearch={setSearchTerm}
        isLoading={workHistoryApi.isLoading}
        searchPlaceholder="Search by applicant, company, job title, or location..."
        emptyMessage="No work history records found"
      />

      {/* Form Modal */}
      <FormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingWorkHistory(null);
          form.reset();
        }}
        title={editingWorkHistory ? 'Edit Work History' : 'Add Work History'}
        onSubmit={form.handleSubmit(handleSubmit)}
        isLoading={createApi.isLoading || updateApi.isLoading}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="applicant">Applicant ID *</Label>
            <Input
              id="applicant"
              {...form.register('applicant')}
              placeholder="Enter applicant ID"
            />
            {form.formState.errors.applicant && (
              <p className="text-sm text-red-600">{form.formState.errors.applicant.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input
              id="companyName"
              {...form.register('companyName')}
              placeholder="Enter company name"
            />
            {form.formState.errors.companyName && (
              <p className="text-sm text-red-600">{form.formState.errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title *</Label>
            <Input
              id="jobTitle"
              {...form.register('jobTitle')}
              placeholder="e.g., Software Engineer, Project Manager"
            />
            {form.formState.errors.jobTitle && (
              <p className="text-sm text-red-600">{form.formState.errors.jobTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="countryCode">Country *</Label>
            <Select
              value={form.watch('countryCode')}
              onValueChange={(value) => form.setValue('countryCode', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countriesApi.data.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.countryCode && (
              <p className="text-sm text-red-600">{form.formState.errors.countryCode.message}</p>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...form.register('location')}
              placeholder="e.g., San Francisco, New York"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startMonth">Start Month *</Label>
            <Select
              value={form.watch('startMonth')?.toString()}
              onValueChange={(value) => form.setValue('startMonth', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.startMonth && (
              <p className="text-sm text-red-600">{form.formState.errors.startMonth.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="startYear">Start Year *</Label>
            <Input
              id="startYear"
              type="number"
              {...form.register('startYear', { valueAsNumber: true })}
              placeholder="e.g., 2020"
              min="1900"
              max={new Date().getFullYear()}
            />
            {form.formState.errors.startYear && (
              <p className="text-sm text-red-600">{form.formState.errors.startYear.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endMonth">End Month</Label>
            <Select
              value={form.watch('endMonth')?.toString()}
              onValueChange={(value) => form.setValue('endMonth', value ? parseInt(value) : undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select month (optional)" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endYear">End Year</Label>
            <Input
              id="endYear"
              type="number"
              {...form.register('endYear', { valueAsNumber: true })}
              placeholder="Leave empty if current position"
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              {...form.register('jobDescription')}
              placeholder="Describe your responsibilities and achievements..."
              rows={3}
            />
          </div>
        </div>
      </FormModal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingWorkHistory} onOpenChange={() => setDeletingWorkHistory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the work history record for{' '}
              <strong>{deletingWorkHistory?.applicant}</strong> at{' '}
              <strong>{deletingWorkHistory?.companyName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
