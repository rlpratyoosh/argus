import z from 'zod';
import createIncidentSchema from './create-incident.schema';

const updateIncidentUserSchema = createIncidentSchema.partial();

const updateIncidentResponderSchema = createIncidentSchema.partial().extend({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
  validation: z.enum(['PENDING', 'VALIDATED', 'REJECTED']).optional(),
});

export { updateIncidentUserSchema, updateIncidentResponderSchema };
