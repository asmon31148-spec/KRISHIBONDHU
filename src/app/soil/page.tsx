'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/i18n/context';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { GuestSavePrompt } from '@/components/auth/GuestSavePrompt';
import {
  FlaskConical,
  Plus,
  AlertCircle,
  Trash2,
} from 'lucide-react';

interface FarmOption {
  id: string;
  name: string;
}

interface SoilRecord {
  id: string;
  farm_id: string | null;
  farms?: { name: string } | null;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number | null;
  organic_carbon: number | null;
  moisture_percentage: number | null;
  test_date: string;
  tested_by: string | null;
  notes: string | null;
  created_at: string;
}

export default function SoilHealthPage() {
  const { t } = useTranslation();
  const { user, isGuest } = useAuth();
  const toast = useToast();

  const [records, setRecords] = useState<SoilRecord[]>([]);
  const [farms, setFarms] = useState<FarmOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGuestPromptOpen, setIsGuestPromptOpen] = useState(false);

  // Form State
  const [farmId, setFarmId] = useState('');
  const [nitrogen, setNitrogen] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [potassium, setPotassium] = useState('');
  const [ph, setPh] = useState('');
  const [organicCarbon, setOrganicCarbon] = useState('');
  const [moisture, setMoisture] = useState('');
  const [testedBy, setTestedBy] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      // Load farms
      const { data: farmsData } = await supabase
        .from('farms')
        .select('id, name')
        .eq('user_id', user.id);

      if (farmsData) setFarms(farmsData as FarmOption[]);

      // Load soil records
      const { data: soilData, error } = await supabase
        .from('soil_records')
        .select('*, farms(name)')
        .eq('user_id', user.id)
        .order('test_date', { ascending: false });

      if (!error && soilData) {
        setRecords(soilData as SoilRecord[]);
      }
    } catch (err) {
      console.error('Error fetching soil data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    if (isGuest) {
      setIsGuestPromptOpen(true);
      return;
    }
    setFarmId(farms[0]?.id || '');
    setNitrogen('');
    setPhosphorus('');
    setPotassium('');
    setPh('');
    setOrganicCarbon('');
    setMoisture('');
    setTestedBy('');
    setTestDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!nitrogen || parseFloat(nitrogen) < 0) {
      toast.error('Please enter a valid Nitrogen (N) value in kg/ha.');
      return;
    }
    if (!phosphorus || parseFloat(phosphorus) < 0) {
      toast.error('Please enter a valid Phosphorus (P) value in kg/ha.');
      return;
    }
    if (!potassium || parseFloat(potassium) < 0) {
      toast.error('Please enter a valid Potassium (K) value in kg/ha.');
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase.from('soil_records').insert({
        user_id: user.id,
        farm_id: farmId || null,
        nitrogen: parseFloat(nitrogen),
        phosphorus: parseFloat(phosphorus),
        potassium: parseFloat(potassium),
        ph: ph ? parseFloat(ph) : null,
        organic_carbon: organicCarbon ? parseFloat(organicCarbon) : null,
        moisture_percentage: moisture ? parseFloat(moisture) : null,
        tested_by: testedBy.trim() || null,
        test_date: testDate,
        notes: notes.trim() || null,
      });

      if (error) {
        toast.error('Failed to log test: ' + error.message);
      } else {
        toast.success('Soil test results saved successfully!');
        setIsModalOpen(false);
        loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    if (!window.confirm('Delete this soil test record?')) return;

    try {
      const supabase = createClient();
      if (!supabase) return;

      const { error } = await supabase
        .from('soil_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (!error) {
        toast.success('Record deleted.');
        loadData();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Deletion failed';
      toast.error(msg);
    }
  };

  // ICAR Standard Fertility Benchmarks
  const getNRating = (val: number) => {
    if (val < 280) return { label: 'Low (<280)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (val <= 560) return { label: 'Medium (280-560)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    return { label: 'High (>560)', color: 'text-blue-800 bg-blue-50 border-blue-200' };
  };

  const getPRating = (val: number) => {
    if (val < 10) return { label: 'Low (<10)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (val <= 25) return { label: 'Medium (10-25)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    return { label: 'High (>25)', color: 'text-blue-800 bg-blue-50 border-blue-200' };
  };

  const getKRating = (val: number) => {
    if (val < 110) return { label: 'Low (<110)', color: 'text-amber-800 bg-amber-50 border-amber-200' };
    if (val <= 280) return { label: 'Medium (110-280)', color: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
    return { label: 'High (>280)', color: 'text-blue-800 bg-blue-50 border-blue-200' };
  };

  const getPhRating = (val: number) => {
    if (val < 6.0) return { label: 'Acidic (<6.0)', color: 'text-amber-800 bg-amber-50' };
    if (val <= 7.5) return { label: 'Optimal (6.0-7.5)', color: 'text-emerald-800 bg-emerald-50' };
    return { label: 'Alkaline (>7.5)', color: 'text-blue-800 bg-blue-50' };
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-brand-forest">
            {t('soil.title')}
          </h1>
          <p className="text-xs sm:text-sm text-brand-dark/70 mt-1">
            {t('soil.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenAdd}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('soil.addRecord')}
        </Button>
      </div>

      {/* Scientific Principle Notice */}
      <div className="p-3.5 bg-cream-100 border border-cream-200 rounded-2xl text-xs text-brand-dark/80 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-brand-harvest shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-brand-forest">
            Laboratory Testing Authenticity Note
          </span>
          <p className="leading-relaxed">
            {t('soil.benchmarkNote')} N-P-K nutrient parameters are strictly recorded from your laboratory or Soil Health Card (SHC) testing reports.
          </p>
        </div>
      </div>

      {/* Soil Records List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-cream-100 rounded-2xl border border-cream-200" />
          ))}
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="w-8 h-8" />}
          title={t('soil.empty')}
          description="Log laboratory or Soil Health Card results for your plots to optimize fertilizer spending."
          actionLabel={t('soil.addRecord')}
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="space-y-4">
          {records.map((rec) => {
            const nRate = getNRating(rec.nitrogen);
            const pRate = getPRating(rec.phosphorus);
            const kRate = getKRating(rec.potassium);

            return (
              <Card key={rec.id} className="hover:border-brand-leaf/40 transition-all">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base sm:text-lg font-bold text-brand-dark">
                        Test Date: {rec.test_date}
                      </CardTitle>
                      {rec.farms?.name && (
                        <Badge variant="forest" size="sm">
                          {rec.farms.name}
                        </Badge>
                      )}
                    </div>
                    {rec.tested_by && (
                      <p className="text-xs text-brand-dark/70">
                        Tested by: <span className="font-medium">{rec.tested_by}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="p-1.5 rounded-lg text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                    aria-label="Delete test record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  {/* NPK Values Grid with ICAR Adequacy Badges */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-4 p-3.5 rounded-2xl bg-cream-50 border border-cream-200/90 text-center">
                    {/* Nitrogen */}
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-xs font-bold text-brand-dark/70 uppercase">
                        Nitrogen (N)
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-brand-forest">
                        {rec.nitrogen} <span className="text-[10px] font-normal text-brand-dark/60">{t('soil.unitKgHa')}</span>
                      </h4>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${nRate.color}`}>
                        {nRate.label}
                      </span>
                    </div>

                    {/* Phosphorus */}
                    <div className="space-y-1 border-x border-cream-200 px-2">
                      <span className="text-[10px] sm:text-xs font-bold text-brand-dark/70 uppercase">
                        Phosphorus (P)
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-brand-forest">
                        {rec.phosphorus} <span className="text-[10px] font-normal text-brand-dark/60">{t('soil.unitKgHa')}</span>
                      </h4>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${pRate.color}`}>
                        {pRate.label}
                      </span>
                    </div>

                    {/* Potassium */}
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-xs font-bold text-brand-dark/70 uppercase">
                        Potassium (K)
                      </span>
                      <h4 className="text-lg sm:text-xl font-black text-brand-forest">
                        {rec.potassium} <span className="text-[10px] font-normal text-brand-dark/60">{t('soil.unitKgHa')}</span>
                      </h4>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${kRate.color}`}>
                        {kRate.label}
                      </span>
                    </div>
                  </div>

                  {/* Secondary Parameters (pH, Organic Carbon, Moisture) */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-brand-dark/80 pt-1">
                    {rec.ph !== null && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-brand-dark">pH:</span>
                        <span className="font-bold">{rec.ph}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPhRating(rec.ph).color}`}>
                          {getPhRating(rec.ph).label}
                        </span>
                      </div>
                    )}

                    {rec.organic_carbon !== null && (
                      <div>
                        <span className="font-semibold text-brand-dark">Organic Carbon:</span>{' '}
                        <span>{rec.organic_carbon}%</span>
                      </div>
                    )}

                    {rec.moisture_percentage !== null && (
                      <div>
                        <span className="font-semibold text-brand-dark">Moisture:</span>{' '}
                        <span>{rec.moisture_percentage}%</span>
                      </div>
                    )}

                    {rec.notes && (
                      <p className="w-full text-xs text-brand-dark/70 italic border-t border-cream-200 pt-2">
                        Note: {rec.notes}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Soil Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={t('soil.addRecord')}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-brand-dark/90">
                Associated Farm Plot
              </label>
              <select
                value={farmId}
                onChange={(e) => setFarmId(e.target.value)}
                className="block w-full rounded-xl border border-cream-300 bg-white px-3.5 py-2.5 text-sm text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-emerald min-h-[44px]"
              >
                <option value="">-- No Specific Plot --</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t('soil.testDate')}
              type="date"
              required
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </div>

          {/* Primary N-P-K Inputs */}
          <div className="p-3.5 bg-cream-50 rounded-2xl border border-cream-200/90 space-y-3">
            <h4 className="text-xs font-bold text-brand-forest uppercase tracking-wider">
              Primary Macronutrients ({t('soil.unitKgHa')})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Nitrogen (N)"
                type="number"
                step="0.1"
                min="0"
                required
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                placeholder="e.g. 290"
              />

              <Input
                label="Phosphorus (P)"
                type="number"
                step="0.1"
                min="0"
                required
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                placeholder="e.g. 18.5"
              />

              <Input
                label="Potassium (K)"
                type="number"
                step="0.1"
                min="0"
                required
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                placeholder="e.g. 195"
              />
            </div>
          </div>

          {/* Optional Soil Quality Parameters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Soil pH (0 - 14)"
              type="number"
              step="0.1"
              min="0"
              max="14"
              value={ph}
              onChange={(e) => setPh(e.target.value)}
              placeholder="e.g. 6.8"
            />

            <Input
              label="Organic Carbon (%)"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={organicCarbon}
              onChange={(e) => setOrganicCarbon(e.target.value)}
              placeholder="e.g. 0.65"
            />

            <Input
              label="Moisture (%)"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={moisture}
              onChange={(e) => setMoisture(e.target.value)}
              placeholder="e.g. 24"
            />
          </div>

          <Input
            label={t('soil.testedBy')}
            value={testedBy}
            onChange={(e) => setTestedBy(e.target.value)}
            placeholder="e.g. KVK Burdwan / State Soil Testing Lab"
          />

          <Input
            label="Additional Field Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Tested after potato harvest before boro rice transplantation"
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-cream-200">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Guest Mode Protection Prompt */}
      <GuestSavePrompt
        isOpen={isGuestPromptOpen}
        onClose={() => setIsGuestPromptOpen(false)}
        featureName="Soil Health Records"
      />
    </div>
  );
}
