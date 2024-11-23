import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { CourseComponent } from 'app/modules/admin/apps/courseboard/courses/course.component';
import { CourseListComponent } from 'app/modules/admin/apps/courseboard/courses/list/course.component';
import { CourseTasksComponent } from 'app/modules/admin/apps/courseboard/courses/course-tasks/course-tasks.component'; // New component

export default [
    {
        path      : '',
        pathMatch : 'full',
        redirectTo: 'courseslist',
    },
    {
        path     : 'courseslist',
        component: CourseComponent,
        children : [
            {
                path     : '',
                component: CourseListComponent,
              
            },
            {
                path     : ':id',
                component: CourseTasksComponent, // New route for course tasks
            }
        ],
    },
] as Routes;
