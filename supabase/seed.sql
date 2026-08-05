with b as (
  select id
  from businesses
  where slug = 'default'
)
insert into faqs (
  business_id,
  question,
  keywords,
  answer,
  sort_order
)
select
  b.id,
  v.question,
  v.keywords,
  v.answer,
  v.sort_order
from b,
(values
  (
    'What are your hours?',
    'hours,open,close,when,time,business hours',
    'We''re open Monday to Friday from 9:00 AM to 5:30 PM, and Saturday from 9:00 AM to 3:00 PM. We''re closed Sundays.',
    1
  ),
  (
    'Where are you located?',
    'location,address,where,parking,directions,find',
    'We''re downtown at 128 Harbor Street. Metered street parking is available out front.',
    2
  ),
  (
    'Do you accept walk-ins?',
    'walk-in,walkin,appointment needed,book ahead,no appointment',
    'We recommend booking ahead so we can give you enough time, but we''ll always try to accommodate walk-ins when possible.',
    3
  ),
  (
    'What is your cancellation policy?',
    'cancel,cancellation,reschedule,refund,late,missed appointment',
    'You can cancel or reschedule up to 24 hours before your appointment at no charge. Just contact us and we''ll help you.',
    4
  ),
  (
    'Do you offer free consultations?',
    'free,cost,price,consultation,quote,fee',
    'Yes. Our initial consultation is free and is a great way to discuss what you need before booking a full appointment.',
    5
  ),
  (
    'How do I book an appointment?',
    'book,booking,schedule,appointment,reserve,time slot',
    'You can book an appointment through the booking option on this website. Select a service, choose an available time, and enter your contact information.',
    6
  ),
  (
    'What services do you offer?',
    'services,offer,available,consultation,appointment,session',
    'We offer consultations, standard appointments, and longer deep-dive sessions. Select the booking option to view the available services.',
    7
  ),
  (
    'How much do your services cost?',
    'cost,price,pricing,fee,fees,how much,payment',
    'Prices depend on the service you select. Please choose a service through the booking page or contact us for an exact quote.',
    8
  ),
  (
    'Do you offer virtual appointments?',
    'virtual,online,video,zoom,remote,phone appointment',
    'Virtual appointments may be available depending on the service. Contact us with the service you need and we''ll confirm the available options.',
    9
  ),
  (
    'How long is an appointment?',
    'duration,length,how long,time,appointment length',
    'Consultations are approximately 30 minutes, standard appointments are approximately 45 minutes, and deep-dive sessions are approximately 90 minutes.',
    10
  ),
  (
    'Can I reschedule my appointment?',
    'reschedule,change appointment,change time,move booking',
    'Yes. You can reschedule up to 24 hours before your appointment at no charge. Contact us and we''ll help you choose another available time.',
    11
  ),
  (
    'What payment methods do you accept?',
    'payment,pay,credit card,debit,cash,method',
    'Please contact us to confirm the payment methods currently accepted for your selected service.',
    12
  ),
  (
    'Is parking available?',
    'parking,park,car,street parking',
    'Yes. Metered street parking is available near our office at 128 Harbor Street.',
    13
  ),
  (
    'What should I bring to my appointment?',
    'bring,documents,prepare,appointment requirements,identification,id',
    'Please bring any documents or information related to your appointment. We''ll let you know in advance if anything specific is required.',
    14
  ),
  (
    'Can I contact you before booking?',
    'contact,call,email,message,question,before booking',
    'Yes. You can submit your contact details and message through the website, and someone from our team will follow up with you.',
    15
  )
) as v(question, keywords, answer, sort_order)
on conflict do nothing;