'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import type { JourneyLocation } from '@/journey.config';

const GEO_URL = '/world-110m.json';

interface Props {
  locations: JourneyLocation[];
}

export default function JourneyMap({ locations }: Props) {
  const [selected, setSelected] = useState<JourneyLocation | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const visited  = locations.filter(l => l.status === 'visited');
  const wishlist = locations.filter(l => l.status === 'wishlist');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* MAP */}
      <div style={{
        position: 'relative',
        background: '#EDE8DF',
        border: '1.5px solid var(--cream-dkr, #C8B89A)',
        borderRadius: '10px 8px 11px 9px / 9px 10px 8px 11px',
        overflow: 'hidden',
      }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ center: [108, 15], scale: 700 }}
          width={800}
          height={480}
          style={{ width: '100%', height: 'auto', display: 'block' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: { rsmKey: string; properties: { name: string } }[] }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: {
                      fill: geo.properties.name === 'Vietnam' ? '#D4C5A9'
                        : geo.properties.name === 'Thailand' ? '#DACED5'
                        : '#E8E2D8',
                      stroke: '#C5B99E',
                      strokeWidth: 0.4,
                      outline: 'none',
                    },
                    hover:   { fill: '#D8CEBD', stroke: '#C5B99E', strokeWidth: 0.4, outline: 'none' },
                    pressed: { fill: '#D8CEBD', outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Visited markers */}
          {visited.map(loc => {
            const isHovered = hovered === loc.id;
            const isSelected = selected?.id === loc.id;
            const isHome    = loc.highlight === 'home';
            const isAbroad  = loc.highlight === 'abroad';
            const isIsland  = loc.highlight === 'island';

            if (isIsland) {
              const s = isHovered || isSelected ? 6 : 4;
              return (
                <Marker
                  key={loc.id}
                  coordinates={loc.coordinates}
                  onClick={() => setSelected(isSelected ? null : loc)}
                  onMouseEnter={() => setHovered(loc.id)}
                  onMouseLeave={() => setHovered(null)}
                >
                  {/* Kim cương nhỏ */}
                  <polygon
                    points={`0,${-s} ${s},0 0,${s} ${-s},0`}
                    fill={isSelected ? '#8B1A1A' : '#DA251D'}
                    stroke="#fff"
                    strokeWidth={1}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  />
                  {isHovered && (
                    <text
                      textAnchor="middle"
                      y={-(s + 6)}
                      style={{ fontFamily: 'var(--mono, monospace)', fontSize: 8, fill: '#DA251D', pointerEvents: 'none' }}
                    >
                      {loc.name}
                    </text>
                  )}
                </Marker>
              );
            }

            const baseR    = isHome ? 7 : isAbroad ? 6 : 5;
            const activeR  = baseR + 2;
            const fill     = isSelected
              ? (isHome ? '#7A5C00' : isAbroad ? '#1A4A7A' : '#8B1A1A')
              : (isHome ? '#C8963E' : isAbroad ? '#4A6FA5' : '#C0392B');
            const textFill = isHome ? '#7A5C00' : isAbroad ? '#4A6FA5' : '#3A3028';

            return (
              <Marker
                key={loc.id}
                coordinates={loc.coordinates}
                onClick={() => setSelected(isSelected ? null : loc)}
                onMouseEnter={() => setHovered(loc.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Outer glow ring for home/abroad */}
                {(isHome || isAbroad) && (
                  <circle
                    r={isHovered || isSelected ? activeR + 3 : baseR + 3}
                    fill="none"
                    stroke={isHome ? '#C8963E' : '#4A6FA5'}
                    strokeWidth={1}
                    strokeOpacity={0.4}
                    style={{ pointerEvents: 'none', transition: 'r 0.15s ease' }}
                  />
                )}
                <circle
                  r={isHovered || isSelected ? activeR : baseR}
                  fill={fill}
                  stroke="#fff"
                  strokeWidth={isHome || isAbroad ? 2 : 1.5}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                />
                {isHovered && (
                  <text
                    textAnchor="middle"
                    y={-(baseR + 8)}
                    style={{ fontFamily: 'var(--mono, monospace)', fontSize: 9, fill: textFill, pointerEvents: 'none' }}
                  >
                    {loc.name}
                  </text>
                )}
              </Marker>
            );
          })}

          {/* Wishlist markers */}
          {wishlist.map(loc => (
            <Marker
              key={loc.id}
              coordinates={loc.coordinates}
              onClick={() => setSelected(selected?.id === loc.id ? null : loc)}
              onMouseEnter={() => setHovered(loc.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <circle
                r={hovered === loc.id || selected?.id === loc.id ? 7 : 5}
                fill="transparent"
                stroke={selected?.id === loc.id ? '#8B1A1A' : '#B0856A'}
                strokeWidth={1.5}
                strokeDasharray="3 2"
                style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
              />
              {(hovered === loc.id) && (
                <text
                  textAnchor="middle"
                  y={-10}
                  style={{
                    fontFamily: 'var(--mono, monospace)',
                    fontSize: 9,
                    fill: '#B0856A',
                    pointerEvents: 'none',
                  }}
                >
                  {loc.name} ✦
                </text>
              )}
            </Marker>
          ))}
        </ComposableMap>

        {/* Legend */}
        <div style={{
          position: 'absolute', bottom: 12, left: 14,
          display: 'flex', gap: 14, alignItems: 'center',
          background: 'rgba(237,232,223,0.88)', backdropFilter: 'blur(4px)',
          padding: '5px 10px', borderRadius: 4,
          fontFamily: 'var(--mono, monospace)', fontSize: 8, color: '#6B5A3A',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12">
              <circle cx="6" cy="6" r="4" fill="none" stroke="#C8963E" strokeWidth="1" strokeOpacity="0.4"/>
              <circle cx="6" cy="6" r="3" fill="#C8963E" stroke="#fff" strokeWidth="1"/>
            </svg>
            gắn bó
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="12" height="12">
              <circle cx="6" cy="6" r="4" fill="none" stroke="#4A6FA5" strokeWidth="1" strokeOpacity="0.4"/>
              <circle cx="6" cy="6" r="3" fill="#4A6FA5" stroke="#fff" strokeWidth="1"/>
            </svg>
            nước ngoài
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10"><circle cx="5" cy="5" r="3.5" fill="#C0392B" stroke="#fff" strokeWidth="1"/></svg>
            đã đi ({visited.length})
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="10" height="10"><circle cx="5" cy="5" r="3.5" fill="none" stroke="#B0856A" strokeWidth="1.5" strokeDasharray="2 1"/></svg>
            muốn đi ({wishlist.length})
          </span>
        </div>
      </div>

      {/* SELECTED LOCATION PANEL */}
      {selected && (
        <div style={{
          marginTop: 16,
          background: 'var(--paper, #F9F6EF)',
          border: '1.5px solid var(--cream-dk, #D9C9A8)',
          borderRadius: '9px 7px 10px 8px / 8px 9px 7px 10px',
          padding: '24px 28px',
          position: 'relative',
        }}>
          {/* Close */}
          <button
            onClick={() => setSelected(null)}
            style={{
              position: 'absolute', top: 14, right: 16,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--mono, monospace)', fontSize: 10,
              color: 'var(--ink-muted, #9A8E7E)',
            }}
          >
            ✕ đóng
          </button>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <h3 style={{
                  fontFamily: 'var(--serif, Georgia)', fontStyle: 'italic',
                  fontSize: 22, fontWeight: 500, color: 'var(--ink, #2C2416)', margin: 0,
                }}>
                  {selected.name}
                </h3>
                <span style={{
                  fontFamily: 'var(--mono, monospace)', fontSize: 8,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  padding: '2px 7px', borderRadius: 2,
                  background: selected.status === 'visited' ? 'var(--tomato, #C0392B)' : 'transparent',
                  color: selected.status === 'visited' ? '#fff' : 'var(--ink-muted, #9A8E7E)',
                  border: selected.status === 'wishlist' ? '1px dashed var(--ink-muted, #9A8E7E)' : 'none',
                }}>
                  {selected.status === 'visited' ? '✓ đã đi' : '✦ muốn đi'}
                </span>
              </div>
              <div style={{
                fontFamily: 'var(--mono, monospace)', fontSize: 9,
                color: 'var(--ink-muted, #9A8E7E)', letterSpacing: '0.05em',
              }}>
                {selected.country}{selected.date ? ` · ${selected.date}` : ''}
              </div>
            </div>
          </div>

          {/* Note */}
          {selected.note && (
            <p style={{
              fontFamily: 'var(--serif, Georgia)', fontSize: 15,
              color: 'var(--ink, #2C2416)', lineHeight: 1.8,
              margin: 0, borderLeft: '3px solid var(--cream-dkr, #C8B89A)',
              paddingLeft: 16,
            }}>
              {selected.note}
            </p>
          )}

          {/* Images */}
          {selected.images && selected.images.length > 0 && (
            <div style={{
              marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap',
            }}>
              {selected.images.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`${selected.name} ${i + 1}`}
                  style={{
                    width: 140, height: 100, objectFit: 'cover',
                    borderRadius: 4, border: '1.5px solid var(--cream-dk, #D9C9A8)',
                  }}
                />
              ))}
            </div>
          )}

          {/* No images placeholder */}
          {(!selected.images || selected.images.length === 0) && selected.status === 'visited' && (
            <div style={{
              marginTop: 14, fontFamily: 'var(--mono, monospace)', fontSize: 8,
              color: 'var(--ink-muted, #9A8E7E)', fontStyle: 'italic',
            }}>
              · · · chưa có ảnh — thêm vào journey.config.ts
            </div>
          )}
        </div>
      )}

      {/* NO SELECTION hint */}
      {!selected && (
        <div style={{
          marginTop: 12, textAlign: 'center',
          fontFamily: 'var(--mono, monospace)', fontSize: 9,
          color: 'var(--ink-muted, #9A8E7E)', letterSpacing: '0.04em',
        }}>
          ↑ click vào điểm trên bản đồ để xem ghi chú
        </div>
      )}
    </div>
  );
}
