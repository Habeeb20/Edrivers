// src/components/drivers/DriverProfileDetails.jsx
import React from 'react';
import {
  Gauge, Car, Truck, MapPin, User, GraduationCap, Wine, Users,
  ShieldCheck, Phone, Briefcase, CheckCircle, X, Clock,
} from 'lucide-react';

const formatLabel = (str = '') =>
  String(str)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

const EDUCATION_LABELS = {
  none: 'No formal education',
  primary: 'Primary school',
  secondary: 'Secondary school (SSCE/WAEC/NECO)',
  vocational: 'Vocational / Trade certificate',
  ond: 'OND',
  hnd: 'HND',
  bachelors: "Bachelor's degree",
  masters: "Master's degree",
  phd: 'PhD',
  other: 'Other',
};

const RELIGION_LABELS = {
  christianity: 'Christianity',
  islam: 'Islam',
  traditional: 'Traditional',
  other: 'Other',
  prefer_not_to_say: 'Prefers not to say',
};

const VEHICLE_LABELS = {
  suv: 'SUV',
  other: 'Other',
};

const Card = ({ icon: Icon, iconColor = 'text-blue-600', title, children, className = '' }) => (
  <div className={`bg-gray-50 rounded-2xl p-5 border border-gray-100 ${className}`}>
    <h3 className="text-base font-bold mb-3 flex items-center gap-2 text-gray-900">
      <Icon className={`h-5 w-5 ${iconColor}`} /> {title}
    </h3>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <p className="text-sm text-gray-700">
    <span className="text-gray-500">{label}: </span>
    {value || <span className="text-gray-400">Not specified</span>}
  </p>
);

const Pill = ({ children, tone = 'blue' }) => {
  const tones = {
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-emerald-100 text-emerald-700',
    gray: 'bg-gray-200 text-gray-700',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>{children}</span>
  );
};

const PillList = ({ items, tone, empty = 'Not specified' }) =>
  items?.length ? (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Pill key={item} tone={tone}>{item}</Pill>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-400">{empty}</p>
  );

const habitText = (does, level, yes, no) =>
  does ? `${yes}${level ? ` (${formatLabel(level)})` : ''}` : no;

/**
 * Renders every DriverProfile field not already shown elsewhere in the modal.
 * Pass showSensitive={false} to hide religion, references and background declaration.
 */
const DriverProfileDetails = ({ profile, showSensitive = true }) => {
  if (!profile) return null;

  const {
    categories = [],
    transmission = [],
    isAvailable,
    vehicleTypes = [],
    otherVehicleTypes = [],
    statesDrivenTo = [],
    statesFamiliarWith = [],
    maritalStatus,
    religion,
    education = {},
    habits = {},
    references = [],
    isExConvict,
    convictionDetails,
    updatedAt,
  } = profile;

  const vehicleLabels = vehicleTypes
    .filter((v) => v !== 'other')
    .map((v) => VEHICLE_LABELS[v] || formatLabel(v));
  const allVehicles = [...vehicleLabels, ...otherVehicleTypes];

  const hasEducation =
    education?.highestLevel || education?.degree || education?.institution ||
    education?.graduationYear || education?.additionalInfo;

  return (
    <div className="space-y-5">
      {/* Specialties & Transmission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card icon={Gauge} iconColor="text-green-600" title="Specialties">
          <PillList items={categories.map(formatLabel)} />
        </Card>

        <Card icon={Car} iconColor="text-orange-600" title="Transmission & Availability">
          <div className="space-y-3">
            <PillList items={transmission.map(formatLabel)} tone="gray" />
            <p className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-gray-400" />
              {isAvailable ? 'Currently available for hire' : 'Currently unavailable'}
            </p>
          </div>
        </Card>
      </div>

      {/* Vehicles */}
      <Card icon={Truck} iconColor="text-orange-600" title="Vehicles Can Drive">
        <PillList items={allVehicles} />
      </Card>

      {/* States */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card icon={MapPin} iconColor="text-rose-600" title="States Driven To">
          <PillList items={statesDrivenTo} tone="green" />
        </Card>
        <Card icon={MapPin} iconColor="text-blue-600" title="States Familiar With">
          <PillList items={statesFamiliarWith} />
        </Card>
      </div>

      {/* Personal & Education */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card icon={User} iconColor="text-sky-600" title="Personal Details">
          <div className="space-y-1.5">
            <Row label="Marital status" value={maritalStatus && formatLabel(maritalStatus)} />
            {showSensitive && (
              <Row label="Religion" value={religion && (RELIGION_LABELS[religion] || formatLabel(religion))} />
            )}
          </div>
        </Card>

        <Card icon={GraduationCap} iconColor="text-amber-600" title="Education">
          {hasEducation ? (
            <div className="space-y-1.5">
              <Row
                label="Highest qualification"
                value={education.highestLevel && (EDUCATION_LABELS[education.highestLevel] || formatLabel(education.highestLevel))}
              />
              {education.degree && <Row label="Course" value={education.degree} />}
              {education.institution && <Row label="Institution" value={education.institution} />}
              {education.graduationYear && <Row label="Graduated" value={education.graduationYear} />}
              {education.additionalInfo && (
                <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 leading-relaxed">
                  {education.additionalInfo}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Not specified</p>
          )}
        </Card>
      </div>

      {/* Lifestyle */}
      <Card icon={Wine} iconColor="text-purple-600" title="Lifestyle">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-6">
          <Row
            label="Smoking"
            value={habitText(habits?.smokes, habits?.smokingLevel, 'Smokes', 'Does not smoke')}
          />
          <Row
            label="Alcohol"
            value={habitText(habits?.drinksAlcohol, habits?.drinkingLevel, 'Drinks', 'Does not drink')}
          />
        </div>
      </Card>

      {showSensitive && (
        <>
          {/* References */}
          <Card icon={Users} iconColor="text-emerald-600" title="References">
            {references.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {references.map((ref, i) => (
                  <div
                    key={ref._id || i}
                    className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{ref.name}</p>
                    {ref.relationship && (
                      <p className="text-xs text-gray-500">{ref.relationship}</p>
                    )}
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                      <Briefcase className="h-4 w-4 text-gray-400 shrink-0" />
                      {ref.occupation}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-gray-700">
                      <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                      <a href={`tel:${ref.contact}`} className="text-blue-600 hover:underline">
                        {ref.contact}
                      </a>
                    </p>
                    <p className="flex items-start gap-2 text-sm text-gray-700">
                      <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                      {ref.address}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No references provided</p>
            )}
          </Card>

          {/* Background declaration */}
          <Card icon={ShieldCheck} iconColor="text-slate-600" title="Background Declaration">
            {isExConvict ? (
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-sm font-medium text-amber-700">
                  <X className="h-4 w-4" /> Declared as an ex-convict
                </p>
                {convictionDetails && (
                  <p className="text-sm text-gray-600 leading-relaxed">{convictionDetails}</p>
                )}
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle className="h-4 w-4 text-emerald-600" /> No conviction declared
              </p>
            )}
          </Card>
        </>
      )}

      {updatedAt && (
        <p className="text-xs text-gray-400 text-right">
          Profile last updated {new Date(updatedAt).toLocaleDateString('en-NG', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}
        </p>
      )}
    </div>
  );
};

export default DriverProfileDetails;