// // src/pages/Driver/HireRequestDetails.jsx
// import React from 'react';
// import { Car, User, Users, Truck, Wallet, Clock, Phone, Ban, CheckCircle } from 'lucide-react';

// const formatLabel = (str = '') =>
//   String(str)
//     .replace(/[-_]/g, ' ')
//     .replace(/\b\w/g, (l) => l.toUpperCase());

// const VEHICLE_LABELS = { suv: 'SUV', other: 'Other' };
// const GENDER_LABELS = { prefer_not_to_say: 'Prefers not to say' };

// const formatDateTime = (value) =>
//   value
//     ? new Date(value).toLocaleString('en-NG', {
//         day: 'numeric',
//         month: 'short',
//         year: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit',
//       })
//     : null;

// const Card = ({ icon: Icon, iconColor = 'text-blue-600', title, children }) => (
//   <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100">
//     <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-900">
//       <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} /> {title}
//     </h3>
//     <div className="space-y-1.5 text-sm text-gray-700">{children}</div>
//   </div>
// );

// const Row = ({ label, value, children }) => (
//   <p>
//     <span className="text-gray-500">{label}: </span>
//     {children ?? (value || <span className="text-gray-400">Not provided</span>)}
//   </p>
// );

// const ImageLink = ({ url, alt }) => (
//   <a
//     href={url}
//     target="_blank"
//     rel="noreferrer"
//     className="block w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0 hover:opacity-90 transition"
//   >
//     <img src={url} alt={alt} className="w-full h-full object-cover" />
//   </a>
// );

// /**
//  * Shows the extra data stored on a hire (works for every status).
//  * Older hires created before these fields existed show a short note instead.
//  */
// const HireRequestDetails = ({ hire }) => {
//   if (!hire) return null;

//   const { clientInfo, passengerInfo, vehicleInfo } = hire;

//   const hasExtra = Boolean(
//     hire.vehicleType || clientInfo?.age || passengerInfo?.passengerType || vehicleInfo?.ownership
//   );

//   const offered = Number(hire.amountOffered) || 0;
//   const callOut = hire.callOutCharge;
//   const hasCallOut = typeof callOut === 'number';

//   const vehicleLabel =
//     hire.vehicleType === 'other'
//       ? hire.vehicleTypeOther || 'Other'
//       : VEHICLE_LABELS[hire.vehicleType] || formatLabel(hire.vehicleType);

//   const cancelledBy =
//     hire.cancelledByRole === 'driver'
//       ? 'You'
//       : hire.cancelledByRole === 'client'
//         ? 'The client'
//         : hire.cancelledByRole === 'admin'
//           ? 'Admin'
//           : null;

//   return (
//     <div className="mt-6 space-y-4">
//       {/* Payment & pricing */}
//       <Card icon={Wallet} iconColor="text-emerald-600" title="Payment & Pricing">
//         <Row label="Status" value={formatLabel(hire.status)} />
//         {hire.hireReference && (
//           <Row label="Reference">
//             <span className="font-mono text-xs">{hire.hireReference}</span>
//           </Row>
//         )}
//         <Row label="Offer" value={`₦${offered.toLocaleString()}`} />
//         {hasCallOut && <Row label="Call-out charge" value={`₦${callOut.toLocaleString()}`} />}
//         {hasCallOut && (
//           <Row label="Total">
//             <strong className="text-gray-900">₦{(offered + callOut).toLocaleString()}</strong>
//           </Row>
//         )}
//         <Row label="Payment" value={formatLabel(hire.paymentStatus)} />
//         {hire.paymentReference && (
//           <Row label="Payment reference">
//             <span className="font-mono text-xs">{hire.paymentReference}</span>
//           </Row>
//         )}
//       </Card>

//       {hasExtra ? (
//         <>
//           {/* Vehicle wanted */}
//           <Card icon={Car} iconColor="text-orange-600" title="Vehicle Requested">
//             <Row label="Type" value={vehicleLabel} />
//           </Card>

//           {/* Client info */}
//           <Card icon={User} iconColor="text-sky-600" title="About the Client">
//             <Row label="Age" value={clientInfo?.age ? `${clientInfo.age} years` : null} />
//             <Row
//               label="Gender"
//               value={clientInfo?.gender && (GENDER_LABELS[clientInfo.gender] || formatLabel(clientInfo.gender))}
//             />
//             <Row
//               label="Marital status"
//               value={clientInfo?.maritalStatus && formatLabel(clientInfo.maritalStatus)}
//             />
//           </Card>

//           {/* Passengers */}
//           <Card icon={Users} iconColor="text-purple-600" title="Passengers">
//             <Row
//               label="Driving"
//               value={
//                 passengerInfo?.passengerType === 'self'
//                   ? 'The client'
//                   : passengerInfo?.passengerType === 'others'
//                     ? 'Someone else'
//                     : null
//               }
//             />
//             {passengerInfo?.passengerType === 'others' && (
//               <Row label="Details" value={passengerInfo?.passengerDetails} />
//             )}
//             <Row label="Number of passengers" value={passengerInfo?.numberOfPassengers} />

//             {passengerInfo?.pictures?.length > 0 && (
//               <div className="pt-2">
//                 <p className="text-gray-500 mb-2">Pictures</p>
//                 <div className="flex flex-wrap gap-2.5">
//                   {passengerInfo.pictures.map((url) => (
//                     <ImageLink key={url} url={url} alt="Passenger" />
//                   ))}
//                 </div>
//               </div>
//             )}
//           </Card>

//           {/* Vehicle ownership */}
//           <Card icon={Truck} iconColor="text-amber-600" title="Vehicle Ownership">
//             <Row
//               label="Owned by"
//               value={
//                 vehicleInfo?.ownership === 'self'
//                   ? 'The client'
//                   : vehicleInfo?.ownership === 'others'
//                     ? 'Someone else'
//                     : null
//               }
//             />

//             {vehicleInfo?.ownership === 'others' && vehicleInfo?.owner && (
//               <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 space-y-1.5">
//                 <Row label="Owner" value={vehicleInfo.owner.name} />
//                 <Row label="Relationship" value={vehicleInfo.owner.relationship} />
//                 <Row label="Contact">
//                   {vehicleInfo.owner.contact ? (
//                     <a
//                       href={`tel:${vehicleInfo.owner.contact}`}
//                       className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
//                     >
//                       <Phone className="h-3.5 w-3.5" />
//                       {vehicleInfo.owner.contact}
//                     </a>
//                   ) : (
//                     <span className="text-gray-400">Not provided</span>
//                   )}
//                 </Row>
//                 {vehicleInfo.owner.picture && (
//                   <div className="pt-1">
//                     <p className="text-gray-500 mb-2">Owner's picture</p>
//                     <ImageLink url={vehicleInfo.owner.picture} alt="Vehicle owner" />
//                   </div>
//                 )}
//               </div>
//             )}

//             {vehicleInfo?.vehiclePicture && (
//               <div className="pt-2">
//                 <p className="text-gray-500 mb-2">Picture of the vehicle</p>
//                 <ImageLink url={vehicleInfo.vehiclePicture} alt="Vehicle" />
//               </div>
//             )}
//           </Card>
//         </>
//       ) : (
//         <p className="text-sm text-gray-400 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
//           Vehicle, passenger and client details were not collected for this older request.
//         </p>
//       )}

//       {/* Timeline */}
//       <Card icon={Clock} iconColor="text-indigo-600" title="Timeline">
//         <Row label="Requested" value={formatDateTime(hire.requestedAt)} />
//         {hire.acceptedAt && <Row label="Accepted" value={formatDateTime(hire.acceptedAt)} />}
//         {hire.adminApprovedAt && <Row label="Admin approved" value={formatDateTime(hire.adminApprovedAt)} />}
//         {hire.endedAt && (
//           <Row label={hire.endedEarly ? 'Ended early' : 'Ended'} value={formatDateTime(hire.endedAt)} />
//         )}
//         {hire.endReason && <Row label="End reason" value={hire.endReason} />}
//       </Card>

//       {/* Cancellation */}
//       {hire.status === 'cancelled' && (
//         <div className="rounded-2xl p-4 sm:p-5 border border-red-100 bg-red-50">
//           <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-800">
//             <Ban className="h-4 w-4 sm:h-5 sm:w-5" /> Cancelled
//           </h3>
//           <div className="space-y-1.5 text-sm text-red-900">
//             {cancelledBy && (
//               <p>
//                 <span className="opacity-70">Cancelled by: </span>
//                 {cancelledBy}
//               </p>
//             )}
//             {hire.cancelledAt && (
//               <p>
//                 <span className="opacity-70">On: </span>
//                 {formatDateTime(hire.cancelledAt)}
//               </p>
//             )}
//             <p>
//               <span className="opacity-70">Reason: </span>
//               {hire.cancelReason || 'No reason given'}
//             </p>
//           </div>
//         </div>
//       )}

//       {hire.status === 'ended' && !hire.endedEarly && (
//         <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-700">
//           <CheckCircle className="h-3.5 w-3.5" /> Completed normally
//         </p>
//       )}
//     </div>
//   );
// };

// export default HireRequestDetails;




// src/pages/Driver/HireRequestDetails.jsx
import React from 'react';
import { Car, User, Users, Truck, Wallet, Clock, Phone, Ban, CheckCircle } from 'lucide-react';

const formatLabel = (str = '') =>
  String(str)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());

const VEHICLE_LABELS = { suv: 'SUV', other: 'Other' };
const GENDER_LABELS = { prefer_not_to_say: 'Prefers not to say' };

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

const Card = ({ icon: Icon, iconColor = 'text-blue-600', title, children }) => (
  <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100">
    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-gray-900">
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconColor}`} /> {title}
    </h3>
    <div className="space-y-1.5 text-sm text-gray-700">{children}</div>
  </div>
);

const Row = ({ label, value, children }) => (
  <p>
    <span className="text-gray-500">{label}: </span>
    {children ?? (value || <span className="text-gray-400">Not provided</span>)}
  </p>
);

const ImageLink = ({ url, alt }) => (
  <a
    href={url}
    target="_blank"
    rel="noreferrer"
    className="block w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-gray-200 bg-white shrink-0 hover:opacity-90 transition"
  >
    <img src={url} alt={alt} className="w-full h-full object-cover" />
  </a>
);

/**
 * Shows the extra data stored on a hire (works for every status).
 * Older hires created before these fields existed show a short note instead.
 */
const HireRequestDetails = ({ hire, viewer = 'driver' }) => {
  if (!hire) return null;

  const { clientInfo, passengerInfo, vehicleInfo } = hire;

  const hasExtra = Boolean(
    hire.vehicleType || clientInfo?.age || passengerInfo?.passengerType || vehicleInfo?.ownership
  );

  const offered = Number(hire.amountOffered) || 0;
  const callOut = hire.callOutCharge;
  const hasCallOut = typeof callOut === 'number';

  const vehicleLabel =
    hire.vehicleType === 'other'
      ? hire.vehicleTypeOther || 'Other'
      : VEHICLE_LABELS[hire.vehicleType] || formatLabel(hire.vehicleType);

  // "viewer" is whoever is looking at the screen: 'driver' or 'client'
  const clientLabel = viewer === 'client' ? 'You' : 'The client';
  const cancelledBy =
    hire.cancelledByRole === viewer
      ? 'You'
      : hire.cancelledByRole === 'driver'
        ? 'The driver'
        : hire.cancelledByRole === 'client'
          ? 'The client'
          : hire.cancelledByRole === 'admin'
            ? 'Admin'
            : null;

  return (
    <div className="mt-6 space-y-4">
      {/* Payment & pricing */}
      <Card icon={Wallet} iconColor="text-emerald-600" title="Payment & Pricing">
        <Row label="Status" value={formatLabel(hire.status)} />
        {hire.hireReference && (
          <Row label="Reference">
            <span className="font-mono text-xs">{hire.hireReference}</span>
          </Row>
        )}
        <Row label="Offer" value={`₦${offered.toLocaleString()}`} />
        {hasCallOut && <Row label="Call-out charge" value={`₦${callOut.toLocaleString()}`} />}
        {hasCallOut && (
          <Row label="Total">
            <strong className="text-gray-900">₦{(offered + callOut).toLocaleString()}</strong>
          </Row>
        )}
        <Row label="Payment" value={formatLabel(hire.paymentStatus)} />
        {hire.paymentReference && (
          <Row label="Payment reference">
            <span className="font-mono text-xs">{hire.paymentReference}</span>
          </Row>
        )}
      </Card>

      {hasExtra ? (
        <>
          {/* Vehicle wanted */}
          <Card icon={Car} iconColor="text-orange-600" title="Vehicle Requested">
            <Row label="Type" value={vehicleLabel} />
          </Card>

          {/* Client info */}
          <Card icon={User} iconColor="text-sky-600" title={viewer === 'client' ? 'About You' : 'About the Client'}>
            <Row label="Age" value={clientInfo?.age ? `${clientInfo.age} years` : null} />
            <Row
              label="Gender"
              value={clientInfo?.gender && (GENDER_LABELS[clientInfo.gender] || formatLabel(clientInfo.gender))}
            />
            <Row
              label="Marital status"
              value={clientInfo?.maritalStatus && formatLabel(clientInfo.maritalStatus)}
            />
          </Card>

          {/* Passengers */}
          <Card icon={Users} iconColor="text-purple-600" title="Passengers">
            <Row
              label="Driving"
              value={
                passengerInfo?.passengerType === 'self'
                  ? clientLabel
                  : passengerInfo?.passengerType === 'others'
                    ? 'Someone else'
                    : null
              }
            />
            {passengerInfo?.passengerType === 'others' && (
              <Row label="Details" value={passengerInfo?.passengerDetails} />
            )}
            <Row label="Number of passengers" value={passengerInfo?.numberOfPassengers} />

            {passengerInfo?.pictures?.length > 0 && (
              <div className="pt-2">
                <p className="text-gray-500 mb-2">Pictures</p>
                <div className="flex flex-wrap gap-2.5">
                  {passengerInfo.pictures.map((url) => (
                    <ImageLink key={url} url={url} alt="Passenger" />
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Vehicle ownership */}
          <Card icon={Truck} iconColor="text-amber-600" title="Vehicle Ownership">
            <Row
              label="Owned by"
              value={
                vehicleInfo?.ownership === 'self'
                  ? clientLabel
                  : vehicleInfo?.ownership === 'others'
                    ? 'Someone else'
                    : null
              }
            />

            {vehicleInfo?.ownership === 'others' && vehicleInfo?.owner && (
              <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 space-y-1.5">
                <Row label="Owner" value={vehicleInfo.owner.name} />
                <Row label="Relationship" value={vehicleInfo.owner.relationship} />
                <Row label="Contact">
                  {vehicleInfo.owner.contact ? (
                    <a
                      href={`tel:${vehicleInfo.owner.contact}`}
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {vehicleInfo.owner.contact}
                    </a>
                  ) : (
                    <span className="text-gray-400">Not provided</span>
                  )}
                </Row>
                {vehicleInfo.owner.picture && (
                  <div className="pt-1">
                    <p className="text-gray-500 mb-2">Owner's picture</p>
                    <ImageLink url={vehicleInfo.owner.picture} alt="Vehicle owner" />
                  </div>
                )}
              </div>
            )}

            {vehicleInfo?.vehiclePicture && (
              <div className="pt-2">
                <p className="text-gray-500 mb-2">Picture of the vehicle</p>
                <ImageLink url={vehicleInfo.vehiclePicture} alt="Vehicle" />
              </div>
            )}
          </Card>
        </>
      ) : (
        <p className="text-sm text-gray-400 text-center bg-gray-50 rounded-2xl p-4 border border-gray-100">
          Vehicle, passenger and client details were not collected for this older request.
        </p>
      )}

      {/* Timeline */}
      <Card icon={Clock} iconColor="text-indigo-600" title="Timeline">
        <Row label="Requested" value={formatDateTime(hire.requestedAt)} />
        {hire.acceptedAt && <Row label="Accepted" value={formatDateTime(hire.acceptedAt)} />}
        {hire.adminApprovedAt && <Row label="Admin approved" value={formatDateTime(hire.adminApprovedAt)} />}
        {hire.endedAt && (
          <Row label={hire.endedEarly ? 'Ended early' : 'Ended'} value={formatDateTime(hire.endedAt)} />
        )}
        {hire.endReason && <Row label="End reason" value={hire.endReason} />}
      </Card>

      {/* Cancellation */}
      {hire.status === 'cancelled' && (
        <div className="rounded-2xl p-4 sm:p-5 border border-red-100 bg-red-50">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-800">
            <Ban className="h-4 w-4 sm:h-5 sm:w-5" /> Cancelled
          </h3>
          <div className="space-y-1.5 text-sm text-red-900">
            {cancelledBy && (
              <p>
                <span className="opacity-70">Cancelled by: </span>
                {cancelledBy}
              </p>
            )}
            {hire.cancelledAt && (
              <p>
                <span className="opacity-70">On: </span>
                {formatDateTime(hire.cancelledAt)}
              </p>
            )}
            <p>
              <span className="opacity-70">Reason: </span>
              {hire.cancelReason || 'No reason given'}
            </p>
          </div>
        </div>
      )}

      {hire.status === 'ended' && !hire.endedEarly && (
        <p className="flex items-center justify-center gap-1.5 text-xs text-emerald-700">
          <CheckCircle className="h-3.5 w-3.5" /> Completed normally
        </p>
      )}
    </div>
  );
};

export default HireRequestDetails;