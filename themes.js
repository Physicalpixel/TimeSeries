var margin = { top: 40, right: 20, bottom: 135, left: 50 },
    margin2 = { top: 345, right: 20, bottom: 45, left: 50 },
    width = 900 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom,
    height2 = 450 - margin2.top - margin2.bottom
var range
var top_n

const month = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const svg = d3
    .select('#graph')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

d3.csv('Bar_Race.csv').then(function (data) {
    data = data.map((d) => ({
        date: new Date(d.date),
        value: +d.value,
        name: d.category,
    }))
    var color = d3
        .scaleOrdinal()
        .range(['#f16a70', '#b1d877', '#8cdcda', '#d3d3d3'])
        //pink green blue greay
        .domain(d3.extent(data, (d) => d.category))

    var data1 = data
    function topThemes(start, end) {
        var dataSelect = data1.filter(function (d) {
            var date = new Date(d.date)
            var startDate = new Date(start)
            var endDate = new Date(end)

            if (date >= startDate && date <= endDate) {
                return d
            }
        })

        var sorted = dataSelect.sort(function (a, b) {
            return a.value - b.value
        })
        top_n = sorted.reverse().slice(0, 8)
        return top_n
    }

    let xScale = d3
        .scaleTime()
        .range([0, width])
        .domain(d3.extent(data, (d) => d.date))

    let xScale2 = d3
        .scaleTime()
        .range([0, width])
        .domain(d3.extent(data, (d) => d.date))
    let widthScale = d3
        .scaleLinear()
        .range([0, width])
        .domain(d3.extent(data, (d) => d.value))

    let yScale = d3
        .scaleLinear()
        .range([0, height])
        .domain(d3.extent(data, (d) => d.value))
    let xAxis = d3.axisBottom(xScale)
    let xAxis2 = d3.axisBottom(xScale)

    var brush = d3
        .brushX()
        .extent([
            [0, 0],
            [width, height2],
        ])
        .on('brush', brushed)

    var zoom = d3
        .zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([
            [0, 0],
            [width, height],
        ])
        .extent([
            [0, 0],
            [width, height],
        ])
        .on('zoom', zoomed)

    var focus = svg
        .append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    var focusAxis = svg
        .append('g')
        .attr('class', 'focus')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    var context = svg
        .append('g')
        .attr('class', 'context')
        .attr(
            'transform',
            'translate(' + margin2.left + ',' + margin2.top + ')'
        )

    focusAxis
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)

    context
        .append('g')
        .attr('class', 'axis x-axis')
        .attr('transform', 'translate(0,' + height2 + ')')
        .call(xAxis2)

    context
        .append('g')
        .attr('class', 'brush')
        .call(brush)
        .call(brush.move, xScale.range())
    /*context
        .append('g')
        .attr('class', 'brush')
        .call(brush)
        .call(brush.move, [200, 890])*/

    svg.append('rect')
        .attr('class', 'zoom')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'none')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(zoom)

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return

        var s = d3.event.selection || xScale2.range()
        focus.selectAll('text').style('opacity', 0)
        focusAxis.select('.x-axis').call(xAxis)
        xScale.domain(s.map(xScale2.invert, xScale2))
        svg.select('.zoom').call(
            zoom.transform,
            d3.zoomIdentity.scale(width / (s[1] - s[0])).translate(-s[0], 0)
        )
        var range = s.map(xScale2.invert, xScale2)

        var rangeDateStart = range[0].toString().split(' ')
        var rangeDateEnd = range[1].toString().split(' ')
        var start =
            rangeDateStart[1] +
            ' ' +
            rangeDateStart[2] +
            ',' +
            ' ' +
            rangeDateStart[3]

        var end =
            rangeDateEnd[1] +
            ' ' +
            rangeDateEnd[2] +
            ',' +
            ' ' +
            rangeDateEnd[3]

        var data2 = topThemes(start, end)
        let yScale = d3.scaleLinear().range([0, height]).domain([0, 8])
        var newRects = focus
            .selectAll('rect')
            .data(data2)
            .join(function (enter) {
                return enter
                    .append('rect')
                    .attr('fill', 'red')
                    .attr('x', 0)
                    .attr('y', (d, i) => {
                        return yScale(i)
                    })
                    .attr('width', (d) => {
                        return widthScale(d.value)
                    })
                    .attr('height', 25)
            })
            .attr('fill', (d) => color(d.category))
            .attr('x', 0)
            .attr('y', (d, i) => {
                return yScale(i)
            })
            .attr('width', (d) => {
                return widthScale(d.value)
            })
            .attr('height', 25)

            .style('opacity', 0.8)
        focus
            .selectAll('.text')
            .data(data2)
            .enter()
            .append('text')
            .attr('fill', '#212121')
            .attr('x', 0)
            .attr('y', (d, i) => {
                return yScale(i) + 15
            })
            .attr('width', (d) => {
                return widthScale(d.value)
            })
            .html((d) => d.category)
            .attr('height', 20)
            .attr('font-size', 12)
    }
    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush')
            return // ignore zoom-by-brush
        var t = d3.event.transform
        xScale.domain(t.rescaleX(xScale2).domain())
        focusAxis.select('.x-axis').call(xAxis)
        context
            .select('.brush')
            .call(brush.move, xScale.range().map(t.invertX, t))
    }
    //.ticks(height / 100)

    /* let yAxis2 = svg
        .append('g')
        .call(
            d3.axisLeft(yScale2).tickFormat(d3.timeFormat('%d-%b'))
            //.ticks(height / 100)
        )
        .attr('transform', 'translate(' + width2 + ',' + '0)')*/
})
