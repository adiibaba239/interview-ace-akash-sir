'use server';

/**
 * @fileOverview Generates audio from text using a TTS model.
 *
 * - generateAudio - A function that generates audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

export async function generateAudio(input: string) {
  const generateAudioFlow = ai.defineFlow(
    {
      name: 'generateAudioFlow',
      inputSchema: z.string(),
      outputSchema: z.object({
        media: z.string(),
      }),
    },
    async (query) => {
      const { media } = await ai.generate({
        model: 'googleai/gemini-2.5-flash-preview-tts',
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Algenib' },
            },
          },
        },
        prompt: query,
      });

      if (!media) {
        throw new Error('No media returned from TTS model.');
      }

      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavData = await toWav(audioBuffer);

      return {
        media: 'data:audio/wav;base64,' + wavData,
      };
    }
  );

  return generateAudioFlow(input);
}


async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
