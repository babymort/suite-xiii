# Articulations des poses Open Peeps (repère de la pose, unités SVG d'origine)
# r = côté proche (gauche de l'image), l = côté éloigné (droite de l'image) ; personnages tournés vers la droite (+x)
# n cou · s épaule · e coude · w poignet · h bout de la main · p hanche · k genou · a cheville
J = {}
def put(names, **k): 
    for n in names.split(): J[n] = dict(k)
put('standing/blazer-1 standing/blazer-2', n=(765,120), rs=(440,200), re=(315,550), rw=(510,860), rh=(700,870), ls=(975,200), le=(1085,600), lw=(1150,900), lh=(1125,1165), rp=(712,1040), rk=(605,1545), ra=(462,2148), lp=(974,1040), lk=(890,1564), la=(820,2100))
put('standing/blazer-3 standing/blazer-4', n=(765,120), rs=(440,200), re=(315,550), rw=(510,860), rh=(700,870), ls=(975,200), le=(1085,600), lw=(1150,900), lh=(1125,1165), rp=(710,1040), rk=(602,1580), ra=(460,2150), lp=(960,1055), lk=(855,1580), la=(840,2170))
put('standing/crossed_arms-1', n=(750,110), rs=(470,200), re=(440,560), rw=(640,470), rh=(760,450), ls=(1020,200), le=(1080,520), lw=(860,470), lh=(760,470), rp=(590,1000), rk=(470,1600), ra=(370,2170), lp=(880,1000), lk=(920,1600), la=(940,2180), lock=['r', 'l'])
put('standing/crossed_arms-2', n=(750,130), rs=(450,200), re=(420,560), rw=(620,470), rh=(740,450), ls=(1020,200), le=(1090,520), lw=(860,470), lh=(760,470), rp=(600,1000), rk=(500,1550), ra=(370,2150), lp=(880,1000), lk=(910,1550), la=(930,2150), lock=['r', 'l'])
put('standing/easing-1 standing/easing-2', n=(750,120), rs=(455,170), re=(450,630), rw=(485,1015), rh=(530,1175), ls=(975,165), le=(1085,640), lw=(1090,1030), lh=(1095,1110), rp=(620,1020), rk=(500,1520), ra=(300,2120), lp=(900,1020), lk=(940,1520), la=(950,2080), hidden=['l'])
put('standing/pointing_finger-1 standing/pointing_finger-2', n=(765,130), rs=(360,240), re=(355,540), rw=(375,900), rh=(395,1060), ls=(985,200), le=(1170,440), lw=(1390,310), lh=(1490,110), rp=(605,1050), rk=(595,1500), ra=(525,1940), lp=(935,1050), lk=(875,1500), la=(800,1950), hrad={'l': 115})
put('standing/polka_dots', n=(750,130), rs=(430,230), re=(400,600), rw=(405,1000), rh=(400,1160), ls=(960,195), le=(1060,565), lw=(1083,900), lh=(1083,1040), rp=(652,1025), rk=(622,1517), ra=(514,2086), lp=(929,1025), lk=(868,1517), la=(775,2086))
put('standing/resting-1 standing/resting-2', n=(710,135), rs=(415,225), re=(378,700), rw=(646,845), rh=(723,1030), ls=(955,210), le=(1060,610), lw=(1077,1045), lh=(1077,1100), rp=(620,1030), rk=(590,1580), ra=(560,2170), lp=(930,1030), lk=(1050,1580), la=(1200,2130), hidden=['l'])
put('standing/robot_dance-1 standing/robot_dance-2 standing/robot_dance-3', n=(740,140), rs=(370,195), re=(235,690), rw=(290,965), rh=(320,1070), ls=(925,195), le=(1015,750), lw=(1170,720), lh=(1385,690), rp=(630,1150), rk=(446,1600), ra=(280,2200), lp=(840,1170), lk=(925,1660), la=(1000,2250))
put('standing/shirt-1 standing/shirt-2', n=(745,120), rs=(470,190), re=(470,630), rw=(497,1020), rh=(525,1175), ls=(1025,180), le=(1120,605), lw=(1150,995), lh=(1136,1135), rp=(636,1022), rk=(580,1660), ra=(455,2160), lp=(942,1022), lk=(886,1660), la=(844,2175))
put('standing/shirt-3 standing/shirt-4', n=(745,120), rs=(478,190), re=(464,617), rw=(506,1019), rh=(533,1172), ls=(1033,180), le=(1131,589), lw=(1158,978), lh=(1144,1117), rp=(658,1061), rk=(547,1617), ra=(436,2200), lp=(950,1061), lk=(853,1617), la=(881,2186))
put('standing/walking-1 standing/walking-2 standing/walking-3', n=(750,115), rs=(436,210), re=(367,756), rw=(658,1006), rh=(756,1075), ls=(964,200), le=(1019,561), lw=(1033,894), lh=(1035,960), rp=(547,1033), rk=(492,1617), ra=(381,1950), lp=(936,1033), lk=(936,1617), la=(922,2144), hidden=['l'])
# assis : poses dessinées (corps fixe), seule la tête s'articule — sauf le bras qui salue (fauteuil roulant)
for n in 'bike closed_legs-1 closed_legs-2 crossed_legs hands_back-1 hands_back-2 mid-1 mid-2 one_leg_up-1 one_leg_up-2 wheelchair'.split():
    J['sitting/' + n] = dict(lock=['r', 'l', 'legs'])
J['sitting/wheelchair'].update(ls=(880,200), le=(1020,430), lw=(1250,290), lh=(1450,150), lock=['r', 'legs'])
