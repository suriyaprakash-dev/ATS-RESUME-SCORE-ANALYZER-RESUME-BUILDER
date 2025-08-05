import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const PieChartComponent = ({ score }) => {
    if (score === null) return null;

    const pieChartData = [
        { name: 'Matched', value: score },
        { name: 'Remaining', value: 100 - score }
    ];

    const pieColors = ['#00C49F', '#f0f0f0'];

    return ( <
        div style = {
            { textAlign: 'center' } } >
        <
        PieChart width = { 250 }
        height = { 250 } >
        <
        Pie data = { pieChartData }
        cx = "50%"
        cy = "50%"
        innerRadius = { 60 }
        outerRadius = { 90 }
        dataKey = "value" >
        {
            pieChartData.map((_, index) => ( <
                Cell key = { `cell-${index}` }
                fill = { pieColors[index % pieColors.length] }
                />
            ))
        } <
        /Pie> <
        Tooltip / >
        <
        Legend / >
        <
        /PieChart>

        <
        div style = {
            {
                marginTop: '-140px',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#00C49F',
                position: 'relative'
            }
        } > { score } %
        <
        /div> <
        /div>
    );
};

export default PieChartComponent;