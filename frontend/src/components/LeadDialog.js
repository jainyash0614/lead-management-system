import React from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

const LeadDialog = ({ isOpen, onClose, onSubmit, lead }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: lead || {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      company: '',
      city: '',
      state: '',
      source: 'website',
      status: 'new',
      score: 50,
      lead_value: 0,
      is_qualified: false
    }
  });

  // Reset form when lead changes
  React.useEffect(() => {
    if (lead) {
      reset(lead);
    } else {
      reset({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        city: '',
        state: '',
        source: 'website',
        status: 'new',
        score: 50,
        lead_value: 0,
        is_qualified: false
      });
    }
  }, [lead, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {lead ? 'Edit Lead' : 'Add New Lead'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label className="form-label">First Name *</label>
              <input
                type="text"
                className={`form-input ${errors.first_name ? 'border-red-500' : ''}`}
                placeholder="First name"
                {...register('first_name', {
                  required: 'First name is required',
                  minLength: {
                    value: 2,
                    message: 'First name must be at least 2 characters'
                  }
                })}
              />
              {errors.first_name && (
                <p className="form-error">{errors.first_name.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                className={`form-input ${errors.last_name ? 'border-red-500' : ''}`}
                placeholder="Last name"
                {...register('last_name', {
                  required: 'Last name is required',
                  minLength: {
                    value: 2,
                    message: 'Last name must be at least 2 characters'
                  }
                })}
              />
              {errors.last_name && (
                <p className="form-error">{errors.last_name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email *</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : ''}`}
                placeholder="Email address"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                placeholder="Phone number"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="form-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Company */}
            <div>
              <label className="form-label">Company</label>
              <input
                type="text"
                className={`form-input ${errors.company ? 'border-red-500' : ''}`}
                placeholder="Company name"
                {...register('company')}
              />
              {errors.company && (
                <p className="form-error">{errors.company.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                className={`form-input ${errors.city ? 'border-red-500' : ''}`}
                placeholder="City"
                {...register('city')}
              />
              {errors.city && (
                <p className="form-error">{errors.city.message}</p>
              )}
            </div>

            {/* State */}
            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                className={`form-input ${errors.state ? 'border-red-500' : ''}`}
                placeholder="State"
                {...register('state')}
              />
              {errors.state && (
                <p className="form-error">{errors.state.message}</p>
              )}
            </div>

            {/* Source */}
            <div>
              <label className="form-label">Source *</label>
              <select
                className={`form-input ${errors.source ? 'border-red-500' : ''}`}
                {...register('source', { required: 'Source is required' })}
              >
                <option value="website">Website</option>
                <option value="facebook_ads">Facebook Ads</option>
                <option value="google_ads">Google Ads</option>
                <option value="referral">Referral</option>
                <option value="events">Events</option>
                <option value="other">Other</option>
              </select>
              {errors.source && (
                <p className="form-error">{errors.source.message}</p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="form-label">Status *</label>
              <select
                className={`form-input ${errors.status ? 'border-red-500' : ''}`}
                {...register('status', { required: 'Status is required' })}
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="lost">Lost</option>
                <option value="won">Won</option>
              </select>
              {errors.status && (
                <p className="form-error">{errors.status.message}</p>
              )}
            </div>

            {/* Score */}
            <div>
              <label className="form-label">Score *</label>
              <input
                type="number"
                min="0"
                max="100"
                className={`form-input ${errors.score ? 'border-red-500' : ''}`}
                placeholder="Score (0-100)"
                {...register('score', {
                  required: 'Score is required',
                  min: { value: 0, message: 'Score must be at least 0' },
                  max: { value: 100, message: 'Score must be at most 100' }
                })}
              />
              {errors.score && (
                <p className="form-error">{errors.score.message}</p>
              )}
            </div>

            {/* Lead Value */}
            <div>
              <label className="form-label">Lead Value *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className={`form-input ${errors.lead_value ? 'border-red-500' : ''}`}
                placeholder="Lead value"
                {...register('lead_value', {
                  required: 'Lead value is required',
                  min: { value: 0, message: 'Lead value must be positive' }
                })}
              />
              {errors.lead_value && (
                <p className="form-error">{errors.lead_value.message}</p>
              )}
            </div>

            {/* Is Qualified */}
            <div className="md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  {...register('is_qualified')}
                />
                <span className="ml-2 text-sm text-gray-700">Is Qualified</span>
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {lead ? 'Update Lead' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadDialog;
