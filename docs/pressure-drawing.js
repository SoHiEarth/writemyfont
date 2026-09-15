/**
 * Pressure Drawing Module
 * Uses perfect-freehand library for pressure-sensitive drawing
 */

class PressureDrawing {
    constructor() {
        this.perfectFreehandModule = null;
        this.currentStroke = [];
        this.isDrawing = false;
        this.lastPoint = null;
        this.hasPressureSupport = false; // Detect whether pressure support is available
        this.pressureCheckCount = 0; // Used to detect pressure support
        this.delayedStart = false;  // Whether the stroke is in a delayed-start state
        this.startPoint = null;     // Starting point of the stroke
        this.moveThreshold = 5;     // Movement threshold in pixels
    }

    // Initialize the perfect-freehand module
    async initialize() {
        try {
            this.perfectFreehandModule = await import('https://unpkg.com/perfect-freehand@1.2.2/dist/esm/index.mjs');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Start a new stroke
    startStroke(x, y, pressure = 0.5) {
        this.isDrawing = true;
        this.currentStroke = [];
        this.lastPoint = { x, y, pressure };
        this.delayedStart = true;  // Enter delayed drawing mode
        this.startPoint = { x, y, pressure };
        this.currentStroke.push([x, y, pressure]);
    }

    // Add a point to the current stroke
    addPoint(x, y, pressure = 0.5) {
        if (!this.isDrawing) return;

        // Check whether the stroke is still in delayed-start mode
        if (this.delayedStart && this.startPoint) {
            const dx = x - this.startPoint.x;
            const dy = y - this.startPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.moveThreshold) {
                // Not enough movement yet; only update the starting pressure
                this.startPoint.pressure = Math.max(this.startPoint.pressure, pressure);
                this.currentStroke[0] = [this.startPoint.x, this.startPoint.y, this.startPoint.pressure];
                this.lastPoint = { x, y, pressure };
                return;
            } else {
                // Begin the actual stroke
                this.delayedStart = false;
            }
        }

        let isSimulatedPressure = false;

        // Only simulate speed-based pressure when there's no real pressure support and the detection count is high enough
        if (pressure === 0.5 && this.lastPoint && !this.hasPressureSupport && this.pressureCheckCount > 3) {
            const dx = x - this.lastPoint.x;
            const dy = y - this.lastPoint.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Adjust pressure based on drawing speed (slower = more pressure)
            const speedFactor = Math.min(1, 10 / Math.max(distance, 1));
            pressure = 0.4 + speedFactor * 0.4; // Range from 0.4 to 0.8; keep it compact to avoid extremes
            isSimulatedPressure = true;
        }

        // Only amplify simulated pressure values to make the effect more obvious
        if (isSimulatedPressure) {
            if (pressure < 0.5) {
                pressure = pressure * 0.9; // Slightly reduce low-pressure values
            } else {
                pressure = 0.4 + (pressure - 0.5) * 1.1; // Slightly increase high-pressure values
            }
        }

        this.currentStroke.push([x, y, pressure]);
        this.lastPoint = { x, y, pressure };
    }

    // Finish the current stroke and return the path
    finishStroke(options = {}) {
        if (!this.isDrawing) {
            this.delayedStart = false;
            this.startPoint = null;
            return null;
        }

        // If the stroke is still in delayed-start mode, it means there was not enough movement; generate a circular dot instead
        if (this.delayedStart && this.startPoint) {
            this.isDrawing = false;
            this.delayedStart = false;
            const strokePoints = [[this.startPoint.x, this.startPoint.y, this.startPoint.pressure]];
            this.startPoint = null;
            return this.generateCircularDot(strokePoints, options);
        }

        // If the stroke is very short (only the starting point), also generate a circular dot
        if (this.currentStroke.length < 2) {
            this.isDrawing = false;
            this.delayedStart = false;
            const strokePoints = [...this.currentStroke];
            this.startPoint = null;
            return this.generateCircularDot(strokePoints, options);
        }

        // Decide dynamically whether to simulate pressure
        const shouldSimulatePressure = !this.hasPressureSupport && this.pressureCheckCount > 3;

        const defaultOptions = {
            size: 12,
            thinning: 0.8,          // Increase the impact of pressure on stroke thickness
            smoothing: 0.5,
            streamline: 0.3,        // Reduce streamlining so the pressure change is more obvious
            simulatePressure: shouldSimulatePressure, // Decide dynamically whether to simulate pressure
            easing: (t) => t,
            start: {
                taper: 0,
                easing: (t) => t,
                cap: true
            },
            end: {
                taper: 25,          // Increase the tapering at the end significantly
                easing: (t) => Math.sin((t * Math.PI) / 2), // Use a sine easing curve for smoother ends
                cap: true           // Use round caps to avoid sharp ends
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            // Copy the stroke points so the original data is not modified
            let strokePoints = [...this.currentStroke];

            // Smooth pressure values
            if (strokePoints.length > 5) {
                strokePoints = this.smoothPressureValues(strokePoints);
            }



            // Check for a stationary point or an extremely short stroke
            if (strokePoints.length <= 3) {
                this.isDrawing = false;
                this.currentStroke = [];
                this.delayedStart = false;
                this.startPoint = null;
                return this.generateCircularDot(strokePoints, finalOptions);
            }

            // Check whether the stroke stays within a very small region
            const bounds = this.calculateBounds(strokePoints);
            const maxDistance = Math.max(bounds.width, bounds.height);

            if (maxDistance < 8) { // If the stroke spans less than 8 pixels
                this.isDrawing = false;
                this.currentStroke = [];
                this.delayedStart = false;
                this.startPoint = null;
                return this.generateCircularDot(strokePoints, finalOptions);
            }

            // Get stroke outline from perfect-freehand
            const outlinePoints = this.perfectFreehandModule.getStroke(strokePoints, finalOptions);

            this.isDrawing = false;
            this.currentStroke = [];
            this.delayedStart = false;
            this.startPoint = null;

            return outlinePoints;
        } catch (error) {
            this.isDrawing = false;
            this.currentStroke = [];
            this.delayedStart = false;
            this.startPoint = null;
            return null;
        }
    }

    // Smooth pressure values to create natural light-heavy-light curve
    smoothPressureValues(strokePoints) {
        if (!strokePoints || strokePoints.length < 5) return strokePoints;

        const points = [...strokePoints];
        const len = points.length;

        // Step 1: Remove unstable regions at the start and end
        let startIndex = 0;
        let endIndex = len;

        // Find the point where the pressure becomes stable at the start
        for (let i = 2; i < Math.min(len - 2, 15); i++) {
            const pressureVariance = this.calculatePressureVariance(points, i - 2, i + 2);
            if (pressureVariance < 0.15) { // Relax the stability threshold
                startIndex = i;
                break;
            }
        }

        // Find the point where the pressure becomes stable at the end
        for (let i = len - 3; i >= Math.max(startIndex + 2, len - 15); i--) {
            const pressureVariance = this.calculatePressureVariance(points, i - 2, i + 2);
            if (pressureVariance < 0.15) { // Relax the stability threshold
                endIndex = i + 1;
                break;
            }
        }

        // Step 2: Keep only the stable region
        const stablePoints = points.slice(startIndex, endIndex);

        if (stablePoints.length < 3) return points; // If the stable region is too small, return the original data

        // Step 3: Smooth the stable region with a moving average
        const smoothedPoints = this.applyMovingAverage(stablePoints);

        // Step 4: Create a natural start and end curve
        const naturalCurve = this.createNaturalPressureCurve(smoothedPoints);

        return naturalCurve;
    }

    // Calculate pressure variance in a range
    calculatePressureVariance(points, start, end) {
        if (start < 0 || end >= points.length || end - start < 2) return 999;

        const pressures = points.slice(start, end + 1).map(p => p[2]);
        const mean = pressures.reduce((a, b) => a + b) / pressures.length;
        const variance = pressures.reduce((acc, p) => acc + Math.pow(p - mean, 2), 0) / pressures.length;

        return Math.sqrt(variance);
    }

    // Apply moving average to smooth pressure values
    applyMovingAverage(points) {
        if (points.length < 3) return points;

        const smoothed = [];
        const windowSize = 5; // Increase the window size so the smoothing effect is more noticeable

        for (let i = 0; i < points.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(points.length - 1, i + Math.floor(windowSize / 2));

            let sumPressure = 0;
            let count = 0;

            for (let j = start; j <= end; j++) {
                sumPressure += points[j][2];
                count++;
            }

            const avgPressure = sumPressure / count;
            smoothed.push([points[i][0], points[i][1], avgPressure]);
        }

        return smoothed;
    }

    // Create natural pressure curve with light start and end
    createNaturalPressureCurve(points) {
        if (points.length < 3) return points;

        const result = [...points];
        const len = result.length;

        // Find the location of the maximum pressure point
        let maxPressure = 0;
        let maxIndex = Math.floor(len / 2);

        for (let i = 0; i < len; i++) {
            if (result[i][2] > maxPressure) {
                maxPressure = result[i][2];
                maxIndex = i;
            }
        }

        // Create a natural pressure curve: light -> heavy -> light
        for (let i = 0; i < len; i++) {
            let factor = 1.0;

            if (i < maxIndex) {
                // Start of stroke: rise from 0.3 to 1.0
                factor = 0.3 + 0.7 * (i / maxIndex);
            } else {
                // End of stroke: fade from 1.0 to 0.2
                factor = 1.0 - 0.8 * ((i - maxIndex) / (len - 1 - maxIndex));
                factor = Math.max(0.2, factor);
            }

            // Apply the gradient factor while preserving the relative pressure variation
            result[i][2] = result[i][2] * factor;
        }

        return result;
    }

    // Calculate bounds of stroke points
    calculateBounds(strokePoints) {
        if (!strokePoints || strokePoints.length === 0) {
            return { width: 0, height: 0, minX: 0, maxX: 0, minY: 0, maxY: 0 };
        }

        let minX = strokePoints[0][0];
        let maxX = strokePoints[0][0];
        let minY = strokePoints[0][1];
        let maxY = strokePoints[0][1];

        for (let i = 1; i < strokePoints.length; i++) {
            const [x, y] = strokePoints[i];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }

        return {
            width: maxX - minX,
            height: maxY - minY,
            minX, maxX, minY, maxY
        };
    }

    // Generate circular dot based on pressure
    generateCircularDot(strokePoints, options) {
        if (!strokePoints || strokePoints.length === 0) return [];

        // Calculate the center point and average pressure
        let centerX = 0;
        let centerY = 0;
        let totalPressure = 0;

        for (const point of strokePoints) {
            centerX += point[0];
            centerY += point[1];
            totalPressure += point[2];
        }

        centerX /= strokePoints.length;
        centerY /= strokePoints.length;
        const avgPressure = totalPressure / strokePoints.length;

        // Calculate radius from pressure
        const baseRadius = (options.size || 12) * 0.6; // Increase the base radius
        const radius = baseRadius * (0.4 + avgPressure * 0.8); // Increase the minimum and maximum radius

        // Generate circular points
        const circlePoints = [];
        const segments = 16; // Number of circular segments

        for (let i = 0; i < segments; i++) {
            const angle = (i * 2 * Math.PI) / segments;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            circlePoints.push([x, y]);
        }

        return circlePoints;
    }

    // Convert stroke outline to SVG path
    outlineToSVGPath(outlinePoints) {
        if (!outlinePoints || outlinePoints.length < 2) return '';

        const path = outlinePoints.reduce((acc, point, index) => {
            const [x, y] = point;
            if (index === 0) {
                return `M${x},${y}`;
            }
            return `${acc}L${x},${y}`;
        }, '');

        return `${path}Z`;
    }

    // Draw stroke outline on canvas
    drawStrokeOnCanvas(ctx, outlinePoints, eraseMode = false) {
        if (!outlinePoints || outlinePoints.length < 2) return;

        ctx.save();

        // Set composite operation for erasing
        ctx.globalCompositeOperation = eraseMode ? "destination-out" : "source-over";

        // Create path from outline points
        ctx.beginPath();
        outlinePoints.forEach((point, index) => {
            const [x, y] = point;
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.closePath();

        // Fill the path
        ctx.fillStyle = eraseMode ? 'rgba(0,0,0,1)' : 'black';
        ctx.fill();

        ctx.restore();
    }

    // Get current stroke points (for preview)
    getCurrentStrokePoints() {
        return [...this.currentStroke];
    }

    // Check if currently drawing
    getIsDrawing() {
        return this.isDrawing;
    }

    // Cancel current stroke
    cancelStroke() {
        this.isDrawing = false;
        this.currentStroke = [];
        this.lastPoint = null;
        this.delayedStart = false;
        this.startPoint = null;
    }

    // Reset pressure detection (useful when switching characters)
    resetPressureDetection() {
        this.hasPressureSupport = false;
        this.pressureCheckCount = 0;
        this.delayedStart = false;
        this.startPoint = null;
    }

    // Create a preview stroke (for real-time drawing feedback)
    createPreviewStroke(options = {}) {
        if (!this.isDrawing || this.currentStroke.length < 8) return null;

        // Do not generate a preview stroke while delayed rendering is active
        if (this.delayedStart) return null;

        // Decide dynamically whether to simulate pressure
        const shouldSimulatePressure = !this.hasPressureSupport && this.pressureCheckCount > 3;

        const defaultOptions = {
            size: 12,
            thinning: 0.8,          // Increase the impact of pressure on thickness
            smoothing: 0.5,
            streamline: 0.3,        // Reduce streamlining so pressure changes are more visible
            simulatePressure: shouldSimulatePressure, // Decide dynamically whether to simulate pressure
            easing: (t) => t,
            start: {
                taper: 0,
                easing: (t) => t,
                cap: true
            },
            end: {
                taper: 25,          // Increase the taper at the end significantly
                easing: (t) => Math.sin((t * Math.PI) / 2), // Use a sine easing curve for smoother ends
                cap: true           // Use round caps to avoid sharp ends
            }
        };

        const finalOptions = { ...defaultOptions, ...options };

        try {
            // Apply pressure smoothing to the preview stroke as well
            let previewPoints = [...this.currentStroke];
            if (previewPoints.length > 5) {
                previewPoints = this.smoothPressureValues(previewPoints);
            }

            return this.perfectFreehandModule.getStroke(previewPoints, finalOptions);
        } catch (error) {
            return null;
        }
    }

    // Simulate pressure from pointer events
    simulatePressure(event, eventType = 'move') {


        // Special handling for pen-up events: use a much lower pressure value
        if (eventType === 'end' && this.lastPoint) {
            return Math.max(0.05, this.lastPoint.pressure * 0.3); // Reduce pressure sharply at pen-up
        }

        // Try to get pressure from pointer event (works with Apple Pencil)
        if (event && event.pressure !== undefined && event.pressure > 0.1 && event.pointerType === 'pen') {
            // Only pointer events from a pen and pressure > 0.1 count as true pressure support
            this.hasPressureSupport = true;

            // Limit the maximum pressure on pen-up events
            let pressure = event.pressure;
            if (eventType === 'end') {
                pressure = Math.min(pressure, 0.6); // Limit maximum pressure at pen-up
            }

            return Math.max(0.1, Math.min(1.0, pressure));
        }

        // Non-pen pointer events (such as finger touches) use simulated pressure
        if (event && event.pointerType && event.pointerType !== 'pen') {
            this.pressureCheckCount++;
            return 0.5; // Return the default value so the speed-based simulation logic can handle it
        }

        // Try to get pressure from touch event
        if (event && event.touches && event.touches.length > 0) {
            const touch = event.touches[0];

            // Apple Pencil support through force property
            if (touch.force !== undefined && touch.force > 0.1 && touch.touchType === 'stylus') {
                // Only stylus touch events with force > 0.1 count as true pressure support
                this.hasPressureSupport = true;

                // Limit the maximum pressure on pen-up events
                let force = touch.force;
                if (eventType === 'end') {
                    force = Math.min(force, 0.6); // Limit maximum pressure at pen-up
                }

                return Math.max(0.1, Math.min(1.0, force));
            }

            // Other touch events (finger touch or missing touchType) do not provide real pressure, so use simulated pressure
            if (!touch.touchType || touch.touchType !== 'stylus') {
                this.pressureCheckCount++;
                return 0.5; // Return the default value so the speed-based simulation logic can handle it
            }
        }

        // Try to get pressure from mouse/pointer events
        if (event && event.buttons !== undefined && event.type && event.type.includes('mouse')) {
            // For mouse events, don't claim pressure support and use default simulation
            // Mouse events do not provide real pressure, so simulated pressure should be used
            this.pressureCheckCount++;
            return 0.5; // Return the default value so the speed-based simulation logic in addPoint can handle it
        }

        // Check for webkitForce (Safari specific for Force Touch)
        if (event && event.webkitForce !== undefined && event.webkitForce > 1.0) {
            // Only webkitForce > 1.0 counts as real pressure support (normal value is 1.0; actual pressure pushes it above that)
            this.hasPressureSupport = true;

            // Limit the maximum pressure on pen-up events
            let force = event.webkitForce;
            if (eventType === 'end') {
                force = Math.min(force, 2.0); // Limit maximum pressure at pen-up
            }

            // webkitForce typically ranges from 1.0-3.0 and needs to be mapped to 0.1-1.0
            const normalizedForce = Math.max(0.1, Math.min(1.0, (force - 1.0) / 2.0 + 0.5));
            return normalizedForce;
        }

        // Increase the detection count
        this.pressureCheckCount++;

        // Default pressure simulation with slight randomization
        if (eventType === 'end') {
            return 0.3; // Use a fixed low pressure value at pen-up
        }
        return 0.5 + Math.random() * 0.3; // Random pressure between 0.5 and 0.8
    }
}

// Export for use in other modules
window.PressureDrawing = PressureDrawing; 