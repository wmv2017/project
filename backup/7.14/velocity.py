#!/usr/bin/python
# -*- coding:utf-8 -*-
import numpy as np

def velocity_vector_2pts(x1,y1,z1,x2,y2,z2):
    interval = 0.016
    pt1 = np.array([x1,y1,z1])
    pt2 = np.array([x2,y2,z2])
    vector = pt2 - pt1
    speed = (np.linalg.norm(vector)/interval)*0.01
    return vector,speed

def find_bounce(caculeted_c):
    index = 0
    min_z = caculeted_c[3][2]
    for i in range(0,caculeted_c.shape[0]):
        if caculeted_c[i][2] < min_z:
            min_z = caculeted_c[i][2]
            index = i

    # bef_index = caculeted_c[2].argsort()[:1]
    return index
    #, af_index



def main():
    vector,dist = velocity_vector_2pts(1,1,1,2,2,2)
    print(vector)
    print('velocity is(m/s): ',dist)

if __name__ == '__main__':
    main()
