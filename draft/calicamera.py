#!/usr/bin/python
# -*- coding:utf-8 -*-
import matplotlib.image as mpimg
import numpy as np
import cv2
import matplotlib.pyplot as plt

obj_points = [[0,1768,0],[305,1768,0],[152.5,1890,71],[152.5,1890,0]]
img_points = [[72,243],[388,258],[157,183],[157,283]]

obj_points = np.array(obj_points)
img_points = np.array(img_points)
obj_points = obj_points.astype('float32')
img_points = img_points.astype('float32')
w = 630
h = 354
size = (w,h)
ret, mtx, dist, rvecs, tvecs = cv2.calibrateCamera([obj_points],[img_points], size ,None,None,flags = cv2.CALIB_USE_INTRINSIC_GUESS)
# # print(ret, mtx, dist, rvecs, tvecs)
# print(type(rvecs))
print(mtx)
# # print(type(tvecs)) #list
# rvec = (0, 0, 0)  # rotation relative to the frame
# print(type(rvec))
rvec = (float(rvecs[0][0]),float(rvecs[0][1]),float(rvecs[0][2]))
# print(rvec)
# tvec = (0, 0, 0)  # translation relative to the frame
tvec = (float(tvecs[0][0]),float(tvecs[0][1]),float(tvecs[0][2]))
# distCoeffs = (0, 0, 0, 0)
objectPoints = np.array([[0,1768,0]]).astype('float32')

img_pts, jacobian = cv2.projectPoints(objectPoints, rvec, tvec, mtx, dist)
# img_pts, jacobian = cv2.projectPoints(obj_points, rvecs, tvecs, cameraMatrix, distCoeffs)
print(img_pts)
