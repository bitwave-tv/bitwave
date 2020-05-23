// Created by xander on 5/23/2020

import jwt_decode from 'jwt-decode';

export const compareTokens = ( t1, t2 ) => {
  const dt1 = jwt_decode( t1 );
  const dt2 = jwt_decode( t2 );
  return dt1.user.avi === dt2.user.avi
    && dt1.user.badge === dt2.user.badge
    && dt1.user.name === dt2.user.name
    && dt1.user.color === dt2.user.color
    && dt1.user.userColor === dt2.user.userColor;
};
