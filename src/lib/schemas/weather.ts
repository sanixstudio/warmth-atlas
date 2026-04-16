import { z } from "zod";

export const openMeteoCurrentSchema = z.object({
  current: z.object({
    temperature_2m: z.number(),
    time: z.string().optional(),
  }),
});

export type OpenMeteoCurrent = z.infer<typeof openMeteoCurrentSchema>;

export const weatherCurrentResponseSchema = z.object({
  temperatureC: z.number(),
  observedAt: z.string().optional(),
});

export type WeatherCurrentResponse = z.infer<typeof weatherCurrentResponseSchema>;
