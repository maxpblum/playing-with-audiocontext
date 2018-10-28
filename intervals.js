// Define some useful just intervals. Not equal temperament.
I = {};
down = (interval) => 1 / interval;
I.P8 = 2.0;
I.P5  = 3.0 * down(I.P8);
I.P4 = 2.0 * down(I.P5);
I.M3 = 5.0 * down(2 * I.P8);
I.m3 = I.P5 * down(I.M3);
I.M6 = 2.0 * down(I.m3);
I.m6 = 2.0 * down(I.M3);

// A major second based specifically on V / V.
I.M2 = I.P5 * I.P5 * down(I.P8);
// A minor second based on the difference between I.M2 and I.m3.
I.m2 = I.m3 / I.M2;

// A minor seventh based on IV / IV.
I.m7 = I.P4 * I.P4;
// A major seventh based on the third of V.
I.M7 = I.P5 * I.M3;
