/**
 * 4CORE OKR Platform - Record Violation Page
 * Based on premium centered form style
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Save, X } from 'lucide-react';
import { Card, CardBody } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { useToast } from '../../shared/components/ui/Toast';

const RecordViolation: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      addToast({
        type: 'success',
        title: 'Violation Recorded',
        message: 'The compliance violation has been logged successfully.'
      });
      setIsSubmitting(false);
      navigate('/governance/violations');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
        >
          <ChevronLeft size={20} className="text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Record a Violation</h1>
          <p className="text-sm text-slate-500 mt-1">Log a new OKR compliance violation</p>
        </div>
      </div>

      <Card variant="default" className="shadow-xl border-slate-200/60">
        <CardBody className="p-8 space-y-8">
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              Violation Category <span className="text-red-500">*</span>
            </label>
            <Select
              options={[
                { value: 'late', label: 'Late Submission' },
                { value: 'compliance', label: 'Non-Compliance' },
                { value: 'integrity', label: 'Data Integrity' },
                { value: 'other', label: 'Other' },
              ]}
              placeholder="Select a category..."
              className="h-12"
            />
          </div>

          {/* Violator */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              Violator <span className="text-red-500">*</span>
            </label>
            <Select
              options={[
                { value: 'user1', label: 'John Doe' },
                { value: 'user2', label: 'Sarah Smith' },
                { value: 'user3', label: 'Mike Johnson' },
              ]}
              placeholder="Select a person..."
              className="h-12"
            />
          </div>

          {/* Business Unit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              Business Unit <span className="text-red-500">*</span>
            </label>
            <Select
              options={[
                { value: 'unit1', label: 'Finance' },
                { value: 'unit2', label: 'Operations' },
                { value: 'unit3', label: 'Sales' },
              ]}
              placeholder="Select a business unit..."
              className="h-12"
            />
          </div>

          {/* Week Reference */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              Week Reference <span className="text-red-500">*</span>
            </label>
            <Input
              value="Week 18, 2026"
              disabled
              className="bg-slate-50 font-medium h-12"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
              Notes / Evidence
            </label>
            <textarea
              className="w-full min-h-[120px] p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm text-slate-700 placeholder:text-slate-400"
              placeholder="Describe the violation in detail — what happened, when, and any supporting evidence..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button 
              variant="secondary" 
              onClick={() => navigate(-1)}
              className="px-6"
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              isLoading={isSubmitting}
              leftIcon={<Save size={18} />}
              className="px-8"
            >
              Save Violation
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Info Alert */}
      <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-100 rounded-xl">
        <AlertCircle className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" />
        <p className="text-xs text-primary-800 leading-relaxed">
          Recording a violation will automatically apply the configured integrity penalty to the violator's performance score. An notification will be sent to the unit director.
        </p>
      </div>
    </div>
  );
};

export default RecordViolation;
