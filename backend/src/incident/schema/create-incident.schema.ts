import z from 'zod';

const createIncidentSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(10).max(1000),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  images: z.array(z.string()).optional(), // Base64 encoded images
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});

export default createIncidentSchema;
