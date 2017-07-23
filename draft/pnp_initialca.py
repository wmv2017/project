#!/usr/bin/python
# -*- coding:utf-8 -*-
import matplotlib.image as mpimg
import numpy as np
import cv2
import matplotlib.pyplot as plt



obj_points1 = [[0,1768,0],[305,1768,0],[152.5,1890,71],[152.5,1890,0]]
img_points1 = [[72,243],[388,258],[157,183],[157,283]]
obj_points1 = np.array(obj_points1)
img_points1 = np.array(img_points1)
obj_points1 = obj_points1.astype('float32')
img_points1 = img_points1.astype('float32')

obj_points = [[0,1768,0],[305,1768,0],[0,0,0],[152.5,1890,0]]
img_points = [[72,243],[388,258],[380,146],[157,283]]
obj_points = np.array(obj_points)
img_points = np.array(img_points)
obj_points = obj_points.astype('float32')
img_points = img_points.astype('float32')
w = 630
h = 354
size = (w,h)

IntrinsicMatrix = cv2.initCameraMatrix2D([obj_points],[img_points],size)

dist_coef = np.zeros(4)

ret, rvec, tvec = cv2.solvePnP(obj_points1, img_points1, IntrinsicMatrix, dist_coef)
print(rvec)
print(tvec)
img_pts, jacobian  = cv2.projectPoints(obj_points1, rvec, tvec, IntrinsicMatrix, dist_coef)
print(img_pts)
# verts = ar_verts * [(x1-x0), (y1-y0), -(x1-x0)*0.3] + (x0, y0, 0)
# verts = cv2.projectPoints(verts, rvec, tvec, K, dist_coef)[0].reshape(-1, 2)
'''[[ 809.09022693    0.          315.        ]
 [   0.          809.09022693  177.        ]
 [   0.            0.            1.        ]]
'''
'''
r
[[-0.50908774]
 [-3.09968997]
 [ 2.00818131]]
 t
[[-697.02868684]
 [-827.55618189]
 [ 661.69687206]]'''
