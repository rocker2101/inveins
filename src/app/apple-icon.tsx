import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0c0c0b',
          borderRadius: '40px',
          border: '4px solid #262624',
        }}
      >
        <span
          style={{
            fontSize: 76,
            fontWeight: 900,
            letterSpacing: '2px',
            color: '#faf9f5',
            fontFamily: 'sans-serif',
            lineHeight: 1,
          }}
        >
          IV
        </span>
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: '6px',
            color: '#c5a880',
            textTransform: 'uppercase',
            fontFamily: 'sans-serif',
            marginTop: '4px',
            lineHeight: 1,
          }}
        >
          INVEINS
        </span>
      </div>
    ),
    {
      ...size,
    }
  );
}
